import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { importSource } from "./helpers.mjs";

const { recordStatistics, readStatistics, statisticsCsv } = await importSource("features/statistics/server.ts");
const { STATISTICS_VERSION, statisticsCatalog } = await importSource("features/statistics/catalog.ts");
assert.equal(STATISTICS_VERSION, "ethics-six-v1");
assert.equal(statisticsCatalog.length, 6);
assert(statisticsCatalog.every(question => question.choices.length === 3));

const sqlite = new DatabaseSync(":memory:");
for (const file of readdirSync("drizzle").filter(name => name.endsWith(".sql")).sort()) sqlite.exec(readFileSync(`drizzle/${file}`, "utf8"));
// This adapter executes real SQLite statements with the same transaction
// boundary as D1 batch, including changes() and rollback on any SQL failure.
function prepared(query, args = []) {
  return { query, args,
    bind: (...values) => prepared(query, values),
    all: async () => ({ success: true, results: sqlite.prepare(query).all(...args) }),
  };
}
const binding = {
  prepare: prepared,
  batch: async statements => {
    sqlite.exec("BEGIN TRANSACTION");
    try {
      const result = statements.map(statement => ({ success: true, meta: sqlite.prepare(statement.query).run(...statement.args) }));
      sqlite.exec("COMMIT");
      return result;
    } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
  },
};
const origin = "https://test.example";
const req = (body, headers = {}) => new Request(`${origin}/api/statistics`, { method: "POST",
  headers: { origin, "content-type": "application/json", ...headers },
  body: typeof body === "string" ? body : JSON.stringify(body),
});
const event = (kind, extra = {}) => ({ version: STATISTICS_VERSION, eventId: randomUUID(), kind, ...extra });
const get = (query = "") => new Request(`${origin}/api/statistics${query}`);
const receiptCount = () => sqlite.prepare("SELECT COUNT(*) AS n FROM statistics_receipts").get().n;
const snapshot = async () => {
  const response = await readStatistics(get(), binding);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  return response.json();
};

// Empty data must include every choice/lens and be distinguishable from outage.
let data = await snapshot();
assert.equal(data.started, 0);
assert.equal(data.completed, 0);
assert.equal(data.questions.length, 6);
assert(data.questions.every(question => question.total === 0 && question.choices.every(choice => choice.count === 0)));
assert.deepEqual(data.lenses.map(lens => lens.count), [0, 0, 0]);
assert.equal((await readStatistics(get())).status, 503);
assert.equal((await recordStatistics(req(event("start")))).status, 503);

const q1 = statisticsCatalog[0];
for (const invalid of [
  null, [], 123, {}, event("unknown"),
  event("start", { version: "old-story" }), event("start", { eventId: "student123" }),
  event("start", { eventId: "00000000-0000-0000-0000-000000000000" }),
  event("start", { studentId: "AB123" }), event("start", { sessionId: randomUUID() }),
  event("start", { questionId: q1.id }), event("complete", { choiceId: q1.choices[0].id }),
  event("answer"), event("answer", { questionId: q1.id, choiceId: "unknown" }),
  event("answer", { questionId: q1.id, choiceId: statisticsCatalog[1].choices[0].id }),
  event("answer", { questionId: "deleted-cctv", choiceId: "evidence" }),
  event("answer", { questionId: q1.id, choiceId: q1.choices[0].id, timestamp: Date.now() }),
]) assert.equal((await recordStatistics(req(invalid), binding)).status, 400);
assert.equal((await recordStatistics(req("{broken"), binding)).status, 400);
assert.equal((await recordStatistics(req(event("start"), { origin: "https://evil.example" }), binding)).status, 403);
assert.equal((await recordStatistics(req(event("start"), { origin: "null" }), binding)).status, 403);
assert.equal((await recordStatistics(req(event("start"), { "sec-fetch-site": "cross-site" }), binding)).status, 403);
assert.equal((await recordStatistics(req(event("start"), { "content-type": "text/plain" }), binding)).status, 415);
assert.equal((await recordStatistics(req(event("start"), { "content-length": "99999" }), binding)).status, 413);
assert.equal((await recordStatistics(req("x".repeat(1025), { "content-length": "1" }), binding)).status, 413);
assert.equal((await recordStatistics(get(), binding)).status, 405);
assert.equal((await readStatistics(req(event("start")), binding)).status, 405);
const rawHeaders = { origin, "content-type": "application/json" };
assert.equal((await recordStatistics(new Request(`${origin}/api/statistics`, { method: "POST", headers: rawHeaders }), binding)).status, 400);
assert.equal((await recordStatistics(new Request(`${origin}/api/statistics`, { method: "POST", headers: rawHeaders, body: new Uint8Array([0xff]) }), binding)).status, 400);
const streamed = new Request(`${origin}/api/statistics`, { method: "POST", headers: rawHeaders, duplex: "half",
  body: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(600)); controller.enqueue(new Uint8Array(600)); controller.close(); } }),
});
assert.equal((await recordStatistics(streamed, binding)).status, 413);
assert.equal(receiptCount(), 0);

// Repeated and overlapping requests increment once; even differently cased UUIDs
// and conflicting retries cannot create another answer under that same receipt.
const started = event("start");
for (const response of await Promise.all(Array.from({ length: 12 }, () => recordStatistics(req(started), binding)))) {
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { ok: true });
}
assert.equal((await recordStatistics(req({ ...started, eventId: started.eventId.toUpperCase() }), binding)).status, 200);
assert.equal((await recordStatistics(req({ ...started, kind: "complete" }), binding)).status, 200);
assert.equal(receiptCount(), 1);
data = await snapshot();
assert.equal(data.started, 1);
assert.equal(data.completed, 0);
const firstAnswer = event("answer", { questionId: q1.id, choiceId: q1.choices[0].id });
await Promise.all(Array.from({ length: 20 }, () => recordStatistics(req(firstAnswer), binding)));
assert.equal((await snapshot()).questions[0].choices[0].count, 1);
const allChoices = statisticsCatalog.flatMap(question => question.choices.map(choice => event("answer", { questionId: question.id, choiceId: choice.id })));
for (const answer of allChoices) assert.equal((await recordStatistics(req(answer), binding)).status, 200);
assert.equal((await recordStatistics(req(event("complete")), binding)).status, 200);
data = await snapshot();
assert.equal(data.completed, 1);
assert.equal(data.questions[0].total, 4);
assert(data.questions.slice(1).every(question => question.total === 3));
assert.equal(data.lenses.reduce((sum, lens) => sum + lens.count, 0), 19);
assert.deepEqual(data.lenses.map(lens => lens.count), [7, 6, 6]);

// A failed second statement rolls the receipt back; retry can therefore succeed.
const beforeFailure = receiptCount();
const retryAfterFailure = event("start");
sqlite.exec("CREATE TRIGGER fail_counter BEFORE INSERT ON statistics_counters BEGIN SELECT RAISE(ABORT, 'private database details'); END;");
const rejected = await recordStatistics(req(retryAfterFailure), binding);
assert.equal(rejected.status, 503);
assert.doesNotMatch(await rejected.text(), /private database/);
assert.equal(receiptCount(), beforeFailure);
sqlite.exec("DROP TRIGGER fail_counter;");
assert.equal((await recordStatistics(req(retryAfterFailure), binding)).status, 200);
assert.equal(receiptCount(), beforeFailure + 1);
assert.equal((await snapshot()).started, 2);
const brokenBinding = { prepare() { throw new Error("sensitive internal details"); } };
for (const response of [await readStatistics(get(), brokenBinding), await recordStatistics(req(event("start")), brokenBinding)]) {
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.doesNotMatch(await response.text(), /sensitive internal/);
}
assert.equal((await readStatistics(get(), { prepare: () => ({ bind: () => ({ all: async () => ({ success: false, results: [] }) }) }) })).status, 503);

// Attendance and aggregates have no relation; receipts contain one hash column.
assert.deepEqual(sqlite.prepare("PRAGMA table_info(statistics_receipts)").all().map(column => column.name), ["receipt_hash"]);
assert.deepEqual(sqlite.prepare("PRAGMA table_info(statistics_counters)").all().map(column => column.name), ["counter_key", "count"]);
for (const table of ["statistics_receipts", "statistics_counters"]) assert.equal(sqlite.prepare(`PRAGMA foreign_key_list(${table})`).all().length, 0);
assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM participants").get().n, 0);
const receipts = sqlite.prepare("SELECT * FROM statistics_receipts").all();
assert(receipts.every(row => /^[a-f0-9]{64}$/.test(row.receipt_hash)));
assert(receipts.some(row => row.receipt_hash === createHash("sha256").update(started.eventId).digest("hex")));
assert(!JSON.stringify(receipts).includes(started.eventId));
sqlite.prepare("INSERT INTO participants (student_id) VALUES (?)").run("PRIVATE-ATTENDANCE-ONLY");
const exported = await readStatistics(get("?format=csv"), binding);
assert.equal(exported.status, 200);
assert.equal(exported.headers.get("cache-control"), "no-store");
assert.match(exported.headers.get("content-disposition"), /attachment/);
assert.match(exported.headers.get("content-type"), /text\/csv/);
const csv = await exported.text();
assert.doesNotMatch(csv, /PRIVATE-ATTENDANCE-ONLY|student_id|joined_at|receipt_hash|eventId/);
assert.equal(csv.trim().split("\r\n").length, 30);
assert.match(csv, /"started","","","","","","2"/);
const escaped = structuredClone(await snapshot());
escaped.questions[0].title = '=HYPERLINK("https://evil.example")';
escaped.questions[0].choices[0].label = 'quoted "label", with\nnewline';
escaped.lenses[0].label = "\t+formula";
const safeCsv = statisticsCsv(escaped);
assert(safeCsv.includes('"\'=HYPERLINK(""https://evil.example"")"'));
assert(safeCsv.includes('"quoted ""label"", with\nnewline"'));
assert(safeCsv.includes('"\'\t+formula"'));
sqlite.close();
console.log("PASS: anonymous aggregate schema, 18 options, strict payloads, same-origin/bounded writes, atomic SQLite retry dedupe and rollback, safe failures, zero snapshots, and attendance-free escaped CSV.");
