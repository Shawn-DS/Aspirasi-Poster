import assert from "node:assert/strict";
import { importSource } from "./helpers.mjs";

const { createStatisticsClient, deliverStatistics, newStatisticsEventId, STATISTICS_STORAGE_KEY } = await importSource("features/statistics/client.ts");
const { STATISTICS_VERSION, statisticsCatalog } = await importSource("features/statistics/catalog.ts");
const { roundedPercentages } = await importSource("features/statistics/statisticsPresentation.ts");

let sequence = 0;
const uuid = () => `12345678-1234-4123-8123-${String(++sequence).padStart(12, "0")}`;
const settled = async client => {
  for (let index = 0; index < 100; index++) {
    await new Promise(resolve => setImmediate(resolve));
    if (!client.snapshot().syncing) return;
  }
  assert.fail("Statistics client did not settle.");
};
const memoryStorage = (initial = null) => {
  let value = initial;
  const writes = [];
  return {
    getItem: key => { assert.equal(key, STATISTICS_STORAGE_KEY); return value; },
    setItem: (key, next) => { assert.equal(key, STATISTICS_STORAGE_KEY); value = next; writes.push(next); },
    read: () => value,
    writes,
  };
};
const create = options => createStatisticsClient({ uuid, deliver: async () => {}, ...options });
const answerAll = client => statisticsCatalog.forEach(question => client.answer(question.id, question.choices[0].id));

// The Wi-Fi HTTP preview still needs secure random receipt IDs on phones that
// expose getRandomValues but restrict randomUUID to HTTPS.
{
  const originalCrypto = globalThis.crypto;
  try {
    Object.defineProperty(globalThis, "crypto", { configurable: true, value: { getRandomValues: value => originalCrypto.getRandomValues(value) } });
    const receipts = Array.from({ length: 20 }, newStatisticsEventId);
    assert.equal(new Set(receipts).size, 20);
    for (const receipt of receipts) assert.match(receipt, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  } finally { Object.defineProperty(globalThis, "crypto", { configurable: true, value: originalCrypto }); }
}

// An entire playthrough emits one receipt per logical event, including while
// delivery is awaiting I/O. Replay never replaces the first answer in this tab.
{
  const storage = memoryStorage();
  const sent = [];
  const states = [];
  const client = create({ storage, deliver: async event => { sent.push(structuredClone(event)); } });
  const unsubscribe = client.subscribe(state => states.push(state));
  client.answer(statisticsCatalog[0].id, statisticsCatalog[0].choices[0].id);
  client.complete();
  assert.equal(sent.length, 0, "No events before joining.");
  client.start(); client.start();
  client.answer("not-a-question", "not-a-choice");
  client.answer(statisticsCatalog[0].id, statisticsCatalog[1].choices[0].id);
  assert.equal(client.snapshot().pending, 1, "Invalid and mismatched choices must not be queued.");
  for (const question of statisticsCatalog.slice(0, -1)) {
    client.answer(question.id, question.choices[0].id);
    client.answer(question.id, question.choices[1].id);
  }
  client.complete();
  assert.equal(storage.read().includes('"kind":"complete"'), false, "Completion waits for all six answers.");
  const final = statisticsCatalog.at(-1);
  client.answer(final.id, final.choices[0].id);
  client.complete(); client.complete();
  await settled(client);
  assert.deepEqual(sent.map(event => event.kind), ["start", ...Array(6).fill("answer"), "complete"]);
  assert.deepEqual(sent.filter(event => event.kind === "answer").map(event => event.choiceId), statisticsCatalog.map(question => question.choices[0].id));
  assert.equal(new Set(sent.map(event => event.eventId)).size, 8, "Events have independent random IDs, without a shared participant ID.");
  assert.deepEqual(client.snapshot(), { pending: 0, syncing: false, error: false, revision: 8 });
  const acknowledged = JSON.parse(storage.read());
  assert.equal(Object.keys(acknowledged).length, 8);
  assert.ok(Object.values(acknowledged).every(value => value === true), "Successful delivery removes answer bodies from the browser store.");
  client.start();
  for (const question of statisticsCatalog) client.answer(question.id, question.choices[2].id);
  client.complete(); await settled(client);
  assert.equal(sent.length, 8, "Replay cannot inflate counts or replace first answers.");
  for (const value of [JSON.stringify(sent), ...storage.writes]) {
    assert.doesNotMatch(value, /studentId|student_id|transcript|message|sessionId|participantId|joinedAt|timestamp/i);
    for (const question of statisticsCatalog) {
      assert.equal(value.includes(question.title), false);
      assert.equal(value.includes(question.choices[0].label), false, "Only catalog IDs cross the statistics boundary.");
    }
  }
  for (const event of sent) assert.deepEqual(Object.keys(event).sort(), (event.kind === "answer" ? ["version", "eventId", "kind", "questionId", "choiceId"] : ["version", "eventId", "kind"]).sort());
  const prior = states.length;
  unsubscribe();
  await client.retry();
  assert.equal(states.length, prior, "Detached subscribers do not receive updates.");
}

// A lost HTTP response may follow a successful server commit. Retrying must
// reuse exactly the same event ID, permitting the server's atomic dedupe.
{
  const storage = memoryStorage();
  const received = [];
  let fail = true;
  const client = create({ storage, deliver: async event => {
    received.push(structuredClone(event));
    if (fail) throw new Error("Response lost after commit");
  } });
  client.start();
  await settled(client);
  assert.equal(client.snapshot().error, true);
  const pending = JSON.parse(storage.read()).start;
  assert.equal(pending.eventId, received[0].eventId);
  client.start(); await settled(client);
  assert.deepEqual(received[1], received[0]);
  fail = false;
  await client.retry();
  assert.deepEqual(received[2], received[0]);
  assert.equal(client.snapshot().pending, 0);
  assert.equal(client.snapshot().error, false);
}

// Refresh reconstructs unsent events and acknowledged flags, preserving order
// and identity even if the original browser was offline throughout the run.
{
  const storage = memoryStorage();
  const offline = create({ storage, deliver: async () => { throw new Error("Offline"); } });
  offline.start(); answerAll(offline); offline.complete();
  await settled(offline);
  const pending = JSON.parse(storage.read());
  assert.equal(offline.snapshot().pending, 8);
  const delivered = [];
  const resumed = create({ storage, deliver: async event => { delivered.push(structuredClone(event)); } });
  resumed.start(); await settled(resumed);
  assert.deepEqual(delivered.map(event => event.eventId), Object.values(pending).map(event => event.eventId));
  assert.deepEqual(delivered.map(event => event.kind), ["start", ...Array(6).fill("answer"), "complete"]);
  const afterRefresh = create({ storage, deliver: async event => { delivered.push(structuredClone(event)); } });
  afterRefresh.start(); answerAll(afterRefresh); afterRefresh.complete();
  await settled(afterRefresh);
  assert.equal(delivered.length, 8);
}

// Storage rejection, invalid JSON, unrecognised slots, and forged/extra event
// fields are never replayed as anonymous events or allowed to break gameplay.
{
  const validStart = { version: STATISTICS_VERSION, eventId: uuid(), kind: "start" };
  const first = statisticsCatalog[0];
  const validAnswer = { version: STATISTICS_VERSION, eventId: uuid(), kind: "answer", questionId: first.id, choiceId: first.choices[0].id };
  const invalid = [
    "{", "null", "[]", '"text"', "x".repeat(16001),
    JSON.stringify({ start: { ...validStart, studentId: "FORBIDDEN" } }),
    JSON.stringify({ start: { ...validStart, eventId: "not-a-uuid" } }),
    JSON.stringify({ start: { ...validStart, version: "old-version" } }),
    JSON.stringify({ start: { ...validStart, kind: "unknown" } }),
    JSON.stringify({ start: validAnswer }),
    JSON.stringify({ [`answer:${first.id}`]: { ...validAnswer, choiceId: "invalid" } }),
    JSON.stringify({ [`answer:${first.id}`]: { ...validAnswer, choiceId: statisticsCatalog[1].choices[0].id } }),
    JSON.stringify({ [`answer:${first.id}`]: { ...validAnswer, transcript: "FORBIDDEN" } }),
    JSON.stringify({ unknown: validStart, studentId: "FORBIDDEN", "answer:unknown": validAnswer }),
  ];
  for (const raw of invalid) {
    const sent = [];
    const client = create({ storage: memoryStorage(raw), deliver: async event => { sent.push(event); } });
    await client.retry();
    assert.equal(sent.length, 0, `Corrupt persisted state was replayed: ${raw.slice(0, 150)}`);
    client.start(); await settled(client);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].kind, "start");
  }
  const blocked = create({ storage: { getItem() { throw new Error("Denied"); }, setItem() { throw new Error("Quota"); } } });
  blocked.start(); answerAll(blocked); blocked.complete(); await settled(blocked);
  assert.equal(blocked.snapshot().revision, 8);
  const memoryOnly = create();
  memoryOnly.start(); answerAll(memoryOnly); memoryOnly.complete(); await settled(memoryOnly);
  assert.equal(memoryOnly.snapshot().revision, 8);
}

// Keep one in-flight flush, then include events enqueued during that pass.
{
  let release;
  let running = 0;
  let maximum = 0;
  const sent = [];
  const client = create({ deliver: async event => {
    maximum = Math.max(maximum, ++running);
    sent.push(event);
    if (event.kind === "start") await new Promise(resolve => { release = resolve; });
    running--;
  } });
  client.start(); client.retry(); client.start();
  answerAll(client); client.complete();
  assert.equal(sent.length, 1);
  release(); await settled(client);
  assert.equal(sent.length, 8);
  assert.equal(maximum, 1);
}

// Requests contain no credentials/attendance identity, and non-success JSON
// cannot be acknowledged. The same event object is sent on every retry.
{
  const originalFetch = globalThis.fetch;
  const event = { version: STATISTICS_VERSION, eventId: uuid(), kind: "start" };
  try {
    let captured;
    globalThis.fetch = async (url, init) => { captured = { url, init }; return new Response('{"ok":true}', { status: 200 }); };
    await deliverStatistics(event);
    assert.equal(captured.url, "/api/statistics");
    assert.equal(captured.init.method, "POST");
    assert.equal(captured.init.credentials, "omit");
    assert.deepEqual(JSON.parse(captured.init.body), event);
    assert.ok(captured.init.signal instanceof AbortSignal);
    for (const [body, status] of [['{"ok":false}', 200], ['{}', 200], ['{"ok":true}', 500], ['invalid json', 200]]) {
      globalThis.fetch = async () => new Response(body, { status });
      await assert.rejects(deliverStatistics(event));
    }
  } finally { globalThis.fetch = originalFetch; }
}

// Percentages remain meaningful for empty, unanimous, tied and tiny samples.
assert.deepEqual(roundedPercentages([]), []);
assert.deepEqual(roundedPercentages([0, 0, 0]), [0, 0, 0]);
assert.deepEqual(roundedPercentages([0, 1, 0]), [0, 100, 0]);
assert.deepEqual(roundedPercentages([1, 1, 1]), [33.4, 33.3, 33.3]);
assert.deepEqual(roundedPercentages([1, 2, 3]), [16.7, 33.3, 50]);
for (const counts of [[1, 999999, 0], [1234, 5678, 9012], [17, 31, 8]]) {
  const values = roundedPercentages(counts);
  assert.ok(values.every(value => value >= 0 && value <= 100));
  assert.equal(Math.round(values.reduce((sum, value) => sum + value, 0) * 10), 1000);
}

console.log("Statistics client: anonymous payloads, first-answer dedupe, retries, refresh, storage failures and chart percentages passed.");
