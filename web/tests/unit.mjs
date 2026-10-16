import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { build } from "esbuild";

async function importSource(path) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node" });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
}
const { conversationReducer: reduce, getEthicsProfile, initialConversation, messageDelay } = await importSource("features/chat/lib/conversation.ts");
const { opening, openingReflections, steps } = await importSource("features/chat/data/story.ts");
const { viewportGeometry } = await importSource("features/chat/lib/viewport.ts");
assert.deepEqual(viewportGeometry({ height: 390, offsetTop: 210, baselineHeight: 844, inputFocused: true }), { height: 390, top: 210, keyboardOpen: true });
assert.deepEqual(viewportGeometry({ height: 844, offsetTop: 210, baselineHeight: 844, inputFocused: false }), { height: 844, top: 0, keyboardOpen: false });
assert.deepEqual(viewportGeometry({ height: 844, offsetTop: -10, baselineHeight: 844, inputFocused: true }), { height: 844, top: 0, keyboardOpen: false });
assert.equal(viewportGeometry({ height: 0, offsetTop: NaN, baselineHeight: 568, inputFocused: false }).height, 568);
const time = "12:00";
const flush = state => { while (state.queue.length) state = reduce(state, { type: "advance", time }); return state; };
let state = initialConversation();
assert.equal(state.messages.length, 0);
assert.deepEqual(state.counts, { deontology: 0, utilitarianism: 0, care: 0 });
assert.equal(reduce(state, { type: "send", text: "Too early", time }), state);
state = flush(state);
assert.equal(state.messages.length, opening.length);
assert.equal(reduce(state, { type: "send", text: "   ", time }), state);
assert.equal(reduce(state, { type: "send", text: "x".repeat(501), time }), state);
for (const text of ["x".repeat(500), "😀".repeat(500), "<script>alert('x')</script>", "Baris pertama\nBaris kedua"]) {
  const sent = reduce(state, { type: "send", text, time });
  assert.equal(sent.messages.at(-1).text, text);
  assert.equal(sent.turn, 1);
  assert.deepEqual(sent.counts, { deontology: 0, utilitarianism: 0, care: 0 });
  assert.equal(reduce(sent, { type: "send", text: "duplicate", time }), sent);
}
assert.equal(steps.length, 8);
assert.equal(new Set(steps.map(step => step.id)).size, 8);
for (const step of steps) {
  assert.equal(step.choices.length, 3);
  assert.equal(new Set(step.choices.map(choice => choice.text)).size, 3);
  assert.equal(new Set(step.choices.map(choice => choice.replies.map(m => m.text).join())).size, 3, "Every option needs a distinct response.");
  assert.deepEqual(new Set(step.choices.map(choice => choice.lens)), new Set(["deontology", "utilitarianism", "care"]));
}
assert.equal(opening.some(m => m.sender === "amir"), false, "Discuss second chances before Amir arrives.");
assert.deepEqual(opening.at(-1), steps[0].prompt);
const routeTranscripts = new Set();
function explore(s, path = []) {
  const step = steps[s.turn];
  for (const choice of step.choices) {
    const sent = reduce(s, { type: "send", text: choice.text, time });
    assert.equal(reduce(sent, { type: "send", text: choice.text, time }), sent, "Double taps cannot skip a question.");
    assert.equal(sent.turn, s.turn + 1);
    assert.equal(sent.counts[choice.lens], s.counts[choice.lens] + 1);
    const expected = [...choice.replies, ...(step.transition ?? [])];
    if (steps[sent.turn]) expected.push(steps[sent.turn].prompt);
    else if (sent.firstChoice) expected.push(openingReflections[sent.firstChoice]);
    assert.deepEqual(sent.queue, expected);
    const next = flush(sent);
    assert.equal(next.messages.filter(m => m.sender === "you").length, next.turn);
    assert.equal(new Set(next.messages.map(m => m.id)).size, next.messages.length);
    if (next.turn < 3) assert.equal(next.messages.some(m => m.sender === "amir"), false);
    if (next.turn >= 3) assert.equal(next.messages.filter(m => m.sender === "system" && m.text.includes("menambah Amir")).length, 1);
    if (next.turn < steps.length) explore(next, [...path, choice.id]);
    else {
      assert.deepEqual(next.ending, choice.ending);
      assert.equal(next.turn, 8);
      assert.equal(next.counts.deontology + next.counts.utilitarianism + next.counts.care, 8);
      routeTranscripts.add(next.messages.map(m => m.text).join("\n"));
      assert.equal(reduce(next, { type: "send", text: "after ending", time }), next);
      assert.deepEqual(reduce(next, { type: "restart" }), initialConversation());
    }
  }
}
explore(state);
assert.equal(routeTranscripts.size, 3 ** 8, "All 6561 choice combinations must complete with distinct transcripts.");

// Verify ethics profiles: pure deontology, pure utilitarianism, pure care, and balanced tie.
for (const lens of ["deontology", "utilitarianism", "care"]) {
  let s = flush(initialConversation());
  while (s.turn < steps.length) {
    const choice = steps[s.turn].choices.find(c => c.lens === lens);
    s = flush(reduce(s, { type: "send", text: choice.text, time }));
  }
  assert.equal(s.counts[lens], 8);
  assert.equal(getEthicsProfile(s.counts).id, lens);
}
assert.equal(getEthicsProfile({ deontology: 3, utilitarianism: 3, care: 2 }).id, "balanced");
assert.equal(getEthicsProfile({ deontology: 0, utilitarianism: 0, care: 0 }).id, "balanced");

// Every stage supports a neutral free-text fallback in the reducer.
for (const freeTurn of [-1, 0, 1, 2, 3, 4, 5, 6, 7]) {
  let s = flush(initialConversation());
  while (s.turn < steps.length) {
    const step = steps[s.turn];
    const useFreeText = freeTurn === -1 || freeTurn === s.turn;
    const text = useFreeText ? "Saya mahu terus berbincang." : step.choices[1].text;
    const sent = reduce(s, { type: "send", text, time });
    assert.deepEqual(sent.queue.slice(0, (useFreeText ? step.fallback : step.choices[1].replies).length), useFreeText ? step.fallback : step.choices[1].replies);
    s = flush(sent);
  }
  assert.equal(s.turn, 8);
  assert.deepEqual(s.ending, freeTurn === -1 || freeTurn === 7 ? null : steps[7].choices[1].ending);
}
const matched = reduce(state, { type: "send", text: `  ${steps[0].choices[0].text}  `, time });
assert.equal(matched.firstChoice, "rights");
const wrongTurn = reduce(state, { type: "send", text: steps[3].choices[0].text, time });
assert.equal(wrongTurn.firstChoice, null);
assert.deepEqual(wrongTurn.queue.slice(0, steps[0].fallback.length), steps[0].fallback);
assert.deepEqual(reduce(matched, { type: "restart" }), initialConversation(), "Restart cancels an unfinished response.");
assert.equal(messageDelay("text", false, true), 180);
assert.ok(messageDelay("x".repeat(500), false, false) <= 1750);
// Guard the MVP's privacy boundary and removal of the old application surface.
for (const path of ["app/admin", "app/print", "lib/session.ts", "components/ui"]) assert.equal(existsSync(path), false, path);
function inspect(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) inspect(path);
    else if (/\.tsx?$/.test(path)) assert.doesNotMatch(readFileSync(path, "utf8"), /\b(localStorage|sessionStorage|indexedDB|fetch)\b/, path);
  }
}
inspect("features/chat");
console.log("PASS: all 6561 eight-question routes, 24 distinct option responses, 3-lens ethics profile (Deontology, Utilitarianism, Ethics of Care, Balanced), one Amir arrival after question 3, endings, Unicode limits, duplicate-send prevention, restart, viewport geometry, reduced motion, and no chat persistence.");
