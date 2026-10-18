import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { build } from "esbuild";

async function importSource(path) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node" });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
}
const { conversationReducer: reduce, getEthicsProfile, initialConversation, LENS_VIBRATION, messageDelay } = await importSource("features/chat/lib/conversation.ts");
const { opening, openingReflections, steps } = await importSource("features/chat/data/story.ts");
const { reactionReply, stickerReply } = await importSource("features/chat/lib/socialReplies.ts");
const { activityAnchors, pendingActivity } = await importSource("features/chat/lib/activities.ts");
const { activityTexts, EVIDENCE_RECORD_ID, toolRecords } = await importSource("features/chat/data/activities.ts");
const emojis = ["👍", "❤️", "🙏", "😮", "😢", "🤝"];
const allIncoming = [opening[1], ...steps.flatMap(step => [step.prompt, ...step.choices.flatMap(choice => choice.replies), ...step.fallback, ...(step.transition ?? [])]), ...Object.values(openingReflections)].filter(m => m.sender !== "system");
for (const source of allIncoming) {
  const answers = emojis.map(emoji => reactionReply(source, emoji));
  assert.equal(new Set(answers.map(reply => reply?.text)).size, 6, "Each emoji has its own response to this message.");
  for (const reply of answers) {
    assert.ok(reply?.text, `Missing contextual reply: ${source.text}`);
    assert.equal(reply.sender, source.sender, "The original speaker answers, including before Amir joins.");
  }
}
assert.match(reactionReply(steps[1].prompt, "👍").text, /bukan bukti/, "Agreement with concern must not endorse prejudice.");
assert.doesNotMatch(reactionReply(steps[6].prompt, "😮").text, /sudah ditemui/, "A reaction cannot reveal a future plot resolution.");
assert.match(reactionReply(steps[6].choices[0].replies[0], "😢").text, /sudah ditemui/, "After resolution, acknowledge that the equipment was found.");
assert.match(reactionReply(steps[6].fallback[0], "😮").text, /sudah ditemui/);
assert.equal(reactionReply({ sender: "you", text: "hello" }, "👍"), null);
assert.equal(reactionReply(opening[1], null), null);
assert.equal(reactionReply(opening[1], "unknown"), null);
assert.equal(reactionReply({ sender: "aina", text: "unknown message" }, "👍"), null, "Never invent an unrelated fallback reply.");
for (const id of ["s12", "s23", "s15", "s24", "s08", "s34", "s37", "s06"]) {
  const response = stickerReply(opening[1], id);
  assert.equal(response.message.sender, "aina");
  assert.ok(response.emoji && response.message.text);
}
assert.match(stickerReply(opening[1], "s37").message.text, /bukti/);
assert.match(stickerReply({ sender: "amir", text: "hello" }, "s34").message.text, /usaha saya/);
const { viewportGeometry } = await importSource("features/chat/lib/viewport.ts");
assert.deepEqual(viewportGeometry({ height: 390, offsetTop: 210, baselineHeight: 844, inputFocused: true }), { height: 390, top: 210, keyboardOpen: true });
assert.deepEqual(viewportGeometry({ height: 844, offsetTop: 210, baselineHeight: 844, inputFocused: false }), { height: 844, top: 0, keyboardOpen: false });
assert.deepEqual(viewportGeometry({ height: 844, offsetTop: -10, baselineHeight: 844, inputFocused: true }), { height: 844, top: 0, keyboardOpen: false });
assert.equal(viewportGeometry({ height: 0, offsetTop: NaN, baselineHeight: 568, inputFocused: false }).height, 568);
assert.equal(typeof LENS_VIBRATION.deontology, "number");
assert.ok(Array.isArray(LENS_VIBRATION.utilitarianism) && LENS_VIBRATION.utilitarianism.length === 5);
assert.ok(Array.isArray(LENS_VIBRATION.care) && LENS_VIBRATION.care.length === 3);
const time = "12:00";
const flush = state => { while (state.queue.length) state = reduce(state, { type: "advance", time }); return state; };
let state = initialConversation();
assert.equal(state.messages.length, 0);
assert.equal(state.lastLens, null);
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
  assert.equal(sent.lastLens, null);
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
    assert.equal(sent.lastLens, choice.lens);
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

// Attachments pause delivery at the relevant story boundary without becoming
// extra ethics answers, changing the selected response, or revealing its ending.
function beforeStep(index) {
  let s = flush(initialConversation());
  while (s.turn < index) s = flush(reduce(s, { type: "send", text: steps[s.turn].choices[0].text, time }));
  return s;
}
assert.deepEqual(activityAnchors([]), {});
assert.equal(pendingActivity(initialConversation(), []), null);
for (const text of [...steps[3].choices.map(choice => choice.text), "Saya mahu terus berbincang."]) {
  const ready = beforeStep(3);
  assert.deepEqual(activityAnchors(ready.messages), {}, "Earlier replies cannot create a buddy card.");
  const sent = reduce(ready, { type: "send", text, time });
  assert.equal(pendingActivity(sent, []), null, "Amir must answer the actual fourth choice before the buddy card.");
  assert.equal(activityAnchors(sent.messages).buddy, undefined);
  const reply = reduce(sent, { type: "advance", time });
  assert.equal(reply.messages.at(-1).text, sent.queue[0].text, "Each original branch response is preserved.");
  assert.equal(pendingActivity(reply, []), "buddy");
  assert.equal(reply.queue[0].text, steps[4].prompt.text, "Question five waits until pairing is complete.");
  assert.equal(activityAnchors(reply.messages).buddy, reply.messages.at(-1).id);
  assert.equal(pendingActivity(reply, ["evidence"]), "buddy", "Completing another activity cannot unlock pairing.");
  assert.equal(pendingActivity(reply, ["buddy"]), null);
  assert.equal(pendingActivity(reply, ["buddy", "buddy"]), null, "Duplicate completion is idempotent.");
  assert.deepEqual(reply.counts, sent.counts, "Attachment delivery does not award a second ethics answer.");
  const continued = flush(reply);
  assert.equal(pendingActivity(continued, []), null, "A late completion cannot reopen an already delivered boundary.");
  assert.equal(activityAnchors(continued.messages).buddy, reply.messages.at(-1).id, "The anchor remains on Amir's response when the next prompt arrives.");
  const restarted = reduce(reply, { type: "restart" });
  assert.equal(pendingActivity(restarted, []), null);
  assert.deepEqual(activityAnchors(restarted.messages), {}, "Restart removes old attachment anchors.");
}
for (const text of [...steps[6].choices.map(choice => choice.text), "Saya mahu terus berbincang."]) {
  const ready = beforeStep(6);
  assert.equal(activityAnchors(ready.messages).evidence, undefined, "The missing-tool prompt does not reveal the record yet.");
  const sent = reduce(ready, { type: "send", text, time });
  const selectedReply = sent.queue[0];
  assert.equal(pendingActivity(sent, ["buddy"]), "evidence", "Find evidence before the branch reveals where the tools were stored.");
  assert.equal(activityAnchors(sent.messages).evidence, sent.messages.at(-1).id);
  assert.equal(pendingActivity(sent, ["buddy", "buddy"]), "evidence", "Repeating the earlier completion cannot bypass the detective activity.");
  assert.equal(pendingActivity(sent, ["evidence"]), null);
  assert.equal(pendingActivity(sent, ["buddy", "evidence", "evidence"]), null);
  assert.equal(reduce(sent, { type: "send", text, time }), sent, "Double taps while an attachment is pending cannot submit another answer.");
  const continued = reduce(sent, { type: "advance", time });
  assert.equal(continued.messages.at(-1).text, selectedReply.text, "The selected seventh answer still gets its own resolution.");
  assert.equal(continued.messages.at(-1).sender, selectedReply.sender);
  assert.equal(pendingActivity(continued, []), null, "The detective gate cannot recur after its branch response.");
  assert.equal(activityAnchors(continued.messages).evidence, sent.messages.at(-1).id);
  assert.deepEqual(continued.counts, sent.counts);
  assert.equal(pendingActivity(reduce(sent, { type: "restart" }), []), null);
}
const completed = [];
const visitedActivities = [];
let withActivities = initialConversation();
while (withActivities.queue.length || withActivities.turn < steps.length) {
  const activity = pendingActivity(withActivities, completed);
  if (activity) {
    visitedActivities.push(activity);
    const snapshot = structuredClone(withActivities);
    completed.push(activity);
    assert.equal(pendingActivity(withActivities, completed), null);
    assert.deepEqual(withActivities, snapshot, "Completing an attachment does not mutate the story state.");
  } else if (withActivities.queue.length) {
    withActivities = reduce(withActivities, { type: "advance", time });
  } else {
    withActivities = reduce(withActivities, { type: "send", text: steps[withActivities.turn].choices[0].text, time });
  }
}
assert.deepEqual(visitedActivities, ["buddy", "evidence"], "Both interactions occur once, in story order.");
assert.deepEqual(withActivities, beforeStep(8), "Adding interactions preserves the original transcript, IDs, ending, and ethics profile.");
assert.equal(pendingActivity(withActivities, []), null, "Neither interaction appears after the ending.");
assert.equal(new Set(toolRecords.map(record => record.id)).size, toolRecords.length, "Record choices need unique identifiers.");
assert.equal(toolRecords.filter(record => record.id === EVIDENCE_RECORD_ID).length, 1, "There is exactly one evidence row to share.");
assert.match(toolRecords.find(record => record.id === EVIDENCE_RECORD_ID).text, /AJK.*kotak peralatan.*stor komuniti/, "The clue supports the existing resolution.");
assert.ok(toolRecords.some(record => record.id !== EVIDENCE_RECORD_ID), "The detective card requires observing more than one record.");

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
const { lookupWord, tokenizeText } = await importSource("features/chat/data/dictionary.ts");
const { copy, ethicsProfiles } = await importSource("features/chat/data/story.ts");
const storyTexts = [
  ...opening.map(m => m.text),
  ...Object.values(openingReflections).map(m => m.text),
  ...Object.values(ethicsProfiles).flatMap(p => [p.title, p.summary]),
  copy.endText,
  copy.endNote,
  ...steps.flatMap(step => [
    step.prompt.text,
    ...step.fallback.map(m => m.text),
    ...(step.transition ?? []).map(m => m.text),
    ...step.choices.flatMap(c => [c.text, ...c.replies.map(m => m.text), ...(c.ending ? [c.ending.title, c.ending.text] : [])]),
  ]),
];
const socialTexts = [
  ...allIncoming.flatMap(source => emojis.map(emoji => reactionReply(source, emoji).text)),
  ...["aina", "lim", "admin", "amir"].flatMap(sender => ["s12", "s23", "s15", "s24", "s08", "s34", "s37", "s06"].map(id => stickerReply({ sender, text: "" }, id).message.text)),
  "Reaksi anda", "Membalas emoji anda",
];
for (const sentence of [...storyTexts, ...socialTexts, ...activityTexts]) {
  const segments = tokenizeText(sentence);
  assert.equal(segments.map(s => s.text).join(""), sentence);
  for (const seg of segments) {
    if (/[a-zA-Z]/.test(seg.text)) {
      assert.ok(seg.lookup && seg.lookup.zh && seg.lookup.en, `Missing dictionary translation for "${seg.text}" in "${sentence}"`);
    }
  }
}
assert.equal(lookupWord("..."), null);
assert.equal(lookupWord("3"), null);
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
console.log("PASS: contextual replies for every story message × 6 reactions, 8 semantic emoji replies, all 6561 eight-question routes, 24 distinct option responses, buddy/evidence gates for all choices and fallbacks, stable activity anchors, 3-lens ethics profile, 100% bilingual story/social/activity dictionary coverage, one Amir arrival after question 3, endings, Unicode limits, duplicate-send prevention, restart, viewport geometry, reduced motion, and no chat persistence.");

