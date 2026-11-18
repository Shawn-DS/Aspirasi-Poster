import {
  isValidStatisticsChoice,
  parseStatisticsEvent,
  STATISTICS_VERSION,
  statisticsCatalog,
  statisticsEventSlotKey,
  type StatisticsEvent,
} from "./catalog";

export const STATISTICS_STORAGE_KEY = `peluang-statistics:${STATISTICS_VERSION}`;
type Outbox = Record<string, StatisticsEvent | true>;
export type StatisticsSyncState = { pending: number; syncing: boolean; error: boolean; revision: number };
type ClientOptions = {
  storage?: Pick<Storage, "getItem" | "setItem">;
  deliver: (event: StatisticsEvent) => Promise<void>;
  uuid: () => string;
};

export function newStatisticsEventId() {
  // Local Wi-Fi previews can use HTTP, where randomUUID is unavailable on some phones.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// One first response per question in this tab session. Receipts for different
// questions have independently random IDs; no attendance identity enters here.
export function createStatisticsClient({ storage, deliver, uuid }: ClientOptions) {
  const orderedKeys = ["start", ...statisticsCatalog.map(question => `answer:${question.id}`), "complete"];
  const slots = new Set(orderedKeys);
  const outbox: Outbox = {};
  try {
    const raw = storage?.getItem(STATISTICS_STORAGE_KEY);
    if (raw && raw.length < 16000) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        for (const [key, value] of Object.entries(parsed)) {
          if (!slots.has(key)) continue;
          if (value === true) {
            outbox[key] = true;
          } else {
            const event = parseStatisticsEvent(value);
            if (event && statisticsEventSlotKey(event) === key) outbox[key] = event;
          }
        }
      }
    }
  } catch { /* A blocked browser store must not interrupt the game. */ }
  let syncing = false;
  let error = false;
  let revision = 0;
  const listeners = new Set<(state: StatisticsSyncState) => void>();
  const snapshot = (): StatisticsSyncState => ({
    pending: Object.values(outbox).filter(value => value !== true).length,
    syncing, error, revision,
  });
  const emit = () => listeners.forEach(listener => listener(snapshot()));
  const persist = () => {
    try { storage?.setItem(STATISTICS_STORAGE_KEY, JSON.stringify(outbox)); } catch { /* Keep retry data in memory. */ }
  };

  async function flush() {
    if (syncing) return;
    syncing = true;
    error = false;
    emit();
    try {
      // Fixed order also preserves start/complete semantics after a refresh.
      for (const key of orderedKeys) {
        const event = outbox[key];
        if (!event || event === true) continue;
        await deliver(event);
        // Successful receipts retain only a flag, not the selected answer.
        outbox[key] = true;
        revision++;
        persist();
        emit();
      }
    } catch {
      error = true;
    } finally {
      syncing = false;
      emit();
    }
    // An event may have been queued while an earlier pass was awaiting I/O.
    if (!error && snapshot().pending) void flush();
  }

  function record(event: StatisticsEvent) {
    const key = statisticsEventSlotKey(event);
    if (outbox[key]) return;
    outbox[key] = event;
    persist();
    emit();
    void flush();
  }

  return {
    snapshot,
    subscribe(listener: (state: StatisticsSyncState) => void) {
      listeners.add(listener);
      listener(snapshot());
      return () => { listeners.delete(listener); };
    },
    start() {
      if (!outbox.start) record({ version: STATISTICS_VERSION, eventId: uuid(), kind: "start" });
      else void flush();
    },
    answer(questionId: string, choiceId: string) {
      if (!outbox.start || !isValidStatisticsChoice(questionId, choiceId)) return;
      if (!outbox[`answer:${questionId}`]) record({ version: STATISTICS_VERSION, eventId: uuid(), kind: "answer", questionId, choiceId });
    },
    complete() {
      if (outbox.complete || !outbox.start || statisticsCatalog.some(question => !outbox[`answer:${question.id}`])) return;
      record({ version: STATISTICS_VERSION, eventId: uuid(), kind: "complete" });
    },
    retry: flush,
  };
}

export async function deliverStatistics(event: StatisticsEvent) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch("/api/statistics", {
      method: "POST", credentials: "omit", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event), signal: controller.signal,
    });
    const result = await response.json() as { ok?: unknown };
    if (!response.ok || result?.ok !== true) throw new Error("Statistics unavailable");
  } finally { clearTimeout(timeout); }
}
