import {
  isJsonContentType,
  isSameOriginRequest,
  jsonReply,
  NO_STORE_HEADERS,
  readBoundedJson,
} from "../../lib/request";
import {
  parseStatisticsEvent,
  STATISTICS_VERSION,
  statisticsCatalog,
  statisticsLenses,
  type StatisticsEvent,
  type StatisticsSnapshot,
} from "./catalog";

export const MAX_STATISTICS_BYTES = 1024;
const unavailable = "Statistik belum tersedia. Sila cuba lagi.";

function eventCounter(event: StatisticsEvent) {
  return event.kind === "answer"
    ? `${STATISTICS_VERSION}:answer:${event.questionId}:${event.choiceId}`
    : `${STATISTICS_VERSION}:${event.kind}`;
}

export async function recordStatistics(request: Request, db?: D1Database): Promise<Response> {
  if (request.method !== "POST") return jsonReply(405, { error: "Kaedah tidak dibenarkan." });
  if (!isSameOriginRequest(request)) {
    return jsonReply(403, { error: "Sila hantar melalui permainan ini." });
  }
  if (!isJsonContentType(request)) {
    return jsonReply(415, { error: "Permintaan tidak sah." });
  }
  const parsed = await readBoundedJson(request, MAX_STATISTICS_BYTES);
  if (!parsed.ok) {
    if (parsed.reason === "too_large") return jsonReply(413, { error: "Permintaan terlalu panjang." });
    return jsonReply(400, { error: "Permintaan tidak sah." });
  }
  const event = parseStatisticsEvent(parsed.value);
  if (!event) return jsonReply(400, { error: "Permintaan tidak sah." });
  if (!db) return jsonReply(503, { error: unavailable });
  try {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(event.eventId.toLowerCase()));
    const receiptHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    // D1 batch is transactional. Only a newly inserted receipt increments the
    // counter. Receipts retain no event type, answers, session or timestamp.
    const result = await db.batch([
      db.prepare("INSERT OR IGNORE INTO statistics_receipts (receipt_hash) VALUES (?)").bind(receiptHash),
      db.prepare("INSERT INTO statistics_counters (counter_key, count) SELECT ?, 1 WHERE changes() = 1 ON CONFLICT(counter_key) DO UPDATE SET count = count + 1").bind(eventCounter(event)),
    ]);
    if (result.some(item => !item.success)) throw new Error("Statistics write failed");
    return jsonReply(200, { ok: true });
  } catch {
    return jsonReply(503, { error: unavailable });
  }
}

function csvField(value: string | number) {
  let text = String(value);
  // Quoting alone does not prevent spreadsheet formulas in exported text.
  if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function statisticsCsv(snapshot: StatisticsSnapshot) {
  const rows: Array<Array<string | number>> = [
    ["version", "category", "question_id", "question", "choice_id", "choice", "lens", "count"],
    [snapshot.version, "started", "", "", "", "", "", snapshot.started],
    [snapshot.version, "completed", "", "", "", "", "", snapshot.completed],
  ];
  for (const question of snapshot.questions) {
    rows.push([snapshot.version, "question_total", question.id, question.title, "", "", "", question.total]);
    for (const choice of question.choices) {
      rows.push([snapshot.version, "answer", question.id, question.title, choice.id, choice.label, choice.lens, choice.count]);
    }
  }
  for (const lens of snapshot.lenses) rows.push([snapshot.version, "lens", "", "", "", lens.label, lens.id, lens.count]);
  return `\uFEFF${rows.map(row => row.map(csvField).join(",")).join("\r\n")}\r\n`;
}

export async function readStatistics(request: Request, db?: D1Database): Promise<Response> {
  if (request.method !== "GET") return jsonReply(405, { error: "Kaedah tidak dibenarkan." });
  if (!db) return jsonReply(503, { error: unavailable });
  try {
    const rows = await db.prepare("SELECT counter_key, count FROM statistics_counters WHERE counter_key LIKE ?")
      .bind(`${STATISTICS_VERSION}:%`).all<{ counter_key: string; count: number }>();
    if (!rows.success) throw new Error("Statistics read failed");
    const counters = new Map(rows.results.map(row => [row.counter_key, row.count]));
    const count = (key: string) => counters.get(`${STATISTICS_VERSION}:${key}`) ?? 0;
    const questions = statisticsCatalog.map(question => {
      const choices = question.choices.map(choice => ({ ...choice, count: count(`answer:${question.id}:${choice.id}`) }));
      return { id: question.id, title: question.title, total: choices.reduce((sum, choice) => sum + choice.count, 0), choices };
    });
    const snapshot: StatisticsSnapshot = {
      version: STATISTICS_VERSION,
      started: count("start"), completed: count("complete"), questions,
      lenses: statisticsLenses.map(lens => ({ ...lens, count: questions.reduce((sum, question) =>
        sum + question.choices.filter(choice => choice.lens === lens.id).reduce((total, choice) => total + choice.count, 0), 0) })),
    };
    if (new URL(request.url).searchParams.get("format") === "csv") {
      return new Response(statisticsCsv(snapshot), { headers: { ...NO_STORE_HEADERS,
        "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="statistik-peluang-kedua.csv"',
      } });
    }
    return jsonReply(200, snapshot);
  } catch {
    return jsonReply(503, { error: unavailable });
  }
}
