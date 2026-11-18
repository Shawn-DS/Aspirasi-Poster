import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { importSource } from "./helpers.mjs";

const { conversationReducer: reduce, getEthicsProfile, initialConversation, LENS_VIBRATION, messageDelay } = await importSource("features/chat/lib/conversation.ts");
const { opening, openingReflections, steps, people } = await importSource("features/chat/data/story.ts");
const { reactionReply, stickerReply } = await importSource("features/chat/lib/socialReplies.ts");
const { activityAnchors, pendingActivity } = await importSource("features/chat/lib/activities.ts");
const { activityTexts, resolveBuddyOutcome } = await importSource("features/chat/data/activities.ts");
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
const majorityReply = reactionReply(steps.find(step => step.id === "majority-justice").prompt, "👍");
assert.match(majorityReply.text, /majoriti.*keadilan.*maruah/, "Agreeing with the discussion does not make majority rejection automatically just.");
const nationReply = reactionReply(steps.find(step => step.id === "nation-building").prompt, "🤝");
assert.match(nationReply.text, /perpaduan.*negara bangsa/, "The new nation-building debate has a relevant social response.");
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
assert.deepEqual(steps.map(step => step.id), ["second-chance", "neighbour-concern", "majority-justice", "nation-building", "community-activity", "next-step"], "The six-question story moves from four debates to participation and reflection.");
for (const step of steps) {
  assert.equal(step.choices.length, 3);
  assert.equal(new Set(step.choices.map(choice => choice.text)).size, 3);
  assert.equal(new Set(step.choices.map(choice => choice.replies.map(m => m.text).join())).size, 3, "Every option needs a distinct response.");
  assert.deepEqual(new Set(step.choices.map(choice => choice.lens)), new Set(["deontology", "utilitarianism", "care"]));
}
assert.equal(opening.some(m => m.sender === "amir"), false, "Discuss second chances before Amir arrives.");
assert.deepEqual(opening.at(-1), steps[0].prompt);
for (const step of steps.slice(0, 4)) {
  const preJoin = [step.prompt, ...step.choices.flatMap(choice => choice.replies), ...step.fallback];
  assert.equal(preJoin.some(message => message.sender === "amir"), false, "Amir cannot speak during the four debates before he joins.");
}
assert.deepEqual(steps.filter(step => step.transition?.some(message => message.sender === "system" && message.text.includes("menambah Amir"))).map(step => step.id), ["nation-building"], "Amir joins once, after the fourth debate.");
const joinTransition = steps[3].transition;
assert.equal(joinTransition[0].sender, "admin");
assert.match(joinTransition[0].text, /Amir bersetuju/, "The invitation respects Amir's consent before adding him.");
assert.match(reactionReply(joinTransition[0], "❤️").text, /Amir bersetuju/, "A reply to the invitation retains its consent context.");
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
    if (next.turn < 4) assert.equal(next.messages.some(m => m.sender === "amir"), false);
    if (next.turn >= 4) {
      assert.equal(next.messages.filter(m => m.sender === "system" && m.text.includes("menambah Amir")).length, 1);
      const arrivalIndex = next.messages.findIndex(m => m.sender === "system" && m.text.includes("menambah Amir"));
      const speechIndex = next.messages.findIndex(m => m.sender === "amir");
      assert.ok(speechIndex > arrivalIndex, "Amir only speaks after the group has added him.");
      assert.equal(next.messages.slice(0, arrivalIndex).filter(m => m.sender === "you").length, 4, "Four user answers must precede Amir's arrival.");
    }
    if (next.turn < steps.length) explore(next, [...path, choice.id]);
    else {
      assert.equal(next.turn, 6);
      assert.equal(next.counts.deontology + next.counts.utilitarianism + next.counts.care, 6);
      assert.deepEqual(next.messages.at(-1), { ...openingReflections[next.firstChoice], id: next.messages.at(-1).id, time });
      routeTranscripts.add(next.messages.map(m => m.text).join("\n"));
      assert.equal(reduce(next, { type: "send", text: "after ending", time }), next);
      assert.deepEqual(reduce(next, { type: "restart" }), initialConversation());
    }
  }
}
explore(state);
assert.equal(routeTranscripts.size, 3 ** 6, "All 729 choice combinations must complete with distinct transcripts.");

// Attachments pause delivery at the relevant story boundary without becoming
// extra ethics answers, changing the selected response, or revealing its ending.
function beforeStep(index) {
  let s = flush(initialConversation());
  while (s.turn < index) s = flush(reduce(s, { type: "send", text: steps[s.turn].choices[0].text, time }));
  return s;
}
assert.deepEqual(activityAnchors([]), {});
assert.equal(pendingActivity(initialConversation(), []), null);
const buddyStepIndex = steps.findIndex(step => step.id === "community-activity");
for (const text of [...steps[buddyStepIndex].choices.map(choice => choice.text), "Saya mahu terus berbincang."]) {
  const ready = beforeStep(buddyStepIndex);
  assert.deepEqual(activityAnchors(ready.messages), {}, "Earlier replies cannot create a buddy card.");
  const sent = reduce(ready, { type: "send", text, time });
  assert.equal(pendingActivity(sent, []), null, "Amir must answer the actual fifth choice before the buddy card.");
  assert.equal(activityAnchors(sent.messages).buddy, undefined);
  const reply = reduce(sent, { type: "advance", time });
  assert.equal(reply.messages.at(-1).text, sent.queue[0].text, "Each original branch response is preserved.");
  assert.equal(pendingActivity(reply, []), "buddy");
  assert.equal(pendingActivity(structuredClone(reply), []), "buddy", "The story boundary depends on authored content, not object identity.");
  assert.equal(reply.queue[0].text, steps[5].prompt.text, "Question six waits until pairing is complete.");
  assert.equal(activityAnchors(reply.messages).buddy, reply.messages.at(-1).id);
  assert.equal(pendingActivity(reply, ["unrelated"]), "buddy", "An unknown completion cannot unlock pairing.");
  assert.equal(pendingActivity(reply, ["buddy"]), null);
  assert.equal(pendingActivity(reply, ["buddy", "buddy"]), null, "Duplicate completion is idempotent.");
  assert.deepEqual(reply.counts, sent.counts, "Attachment delivery does not award a second ethics answer.");
  assert.equal(reduce(reply, { type: "send", text, time }), reply, "Double taps while an attachment is pending cannot submit another answer.");
  const continued = flush(reply);
  assert.equal(pendingActivity(continued, []), null, "A late completion cannot reopen an already delivered boundary.");
  assert.equal(activityAnchors(continued.messages).buddy, reply.messages.at(-1).id, "The anchor remains on Amir's response when the next prompt arrives.");
  const restarted = reduce(reply, { type: "restart" });
  assert.equal(pendingActivity(restarted, []), null);
  assert.deepEqual(activityAnchors(restarted.messages), {}, "Restart removes old attachment anchors.");
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
assert.deepEqual(visitedActivities, ["buddy"], "The team-arrangement interaction occurs exactly once.");
assert.deepEqual(withActivities, beforeStep(6), "Adding the interaction preserves the original transcript, IDs, ending, and ethics profile.");
assert.equal(pendingActivity(withActivities, []), null, "The interaction cannot appear after the ending.");

// All four members can move independently; swapping slots inside a team must
// keep the same partner response, while moving teams changes its proposal.
function permutations(members) {
  if (members.length === 0) return [[]];
  return members.flatMap((member, index) => permutations(members.filter((_, i) => i !== index)).map(tail => [member, ...tail]));
}
const arrangements = permutations(["you", "amir", "aina", "lim"]);
const arrangementOutcomes = new Set();
assert.equal(arrangements.length, 24);
for (const slots of arrangements) {
  const snapshot = [...slots];
  const result = resolveBuddyOutcome(slots);
  arrangementOutcomes.add(result.action);
  const ownTeamOffset = slots.indexOf("you") < 2 ? 0 : 2;
  const ownTeam = slots.slice(ownTeamOffset, ownTeamOffset + 2);
  const otherTeam = slots.filter(member => !ownTeam.includes(member));
  assert.deepEqual(slots, snapshot, "Resolving the arrangement cannot move members.");
  assert.deepEqual(new Set(result.otherPair), new Set(otherTeam), "The displayed other pair matches the actual slots.");
  assert.equal(result.replies.length, 2, "Each submitted arrangement gets two relevant neighbor replies.");
  assert.deepEqual(resolveBuddyOutcome([slots[1], slots[0], slots[3], slots[2]]), result, "Slot order inside each team does not change the outcome.");
  assert.notEqual(resolveBuddyOutcome([...slots.slice(2), ...slots.slice(0, 2)]).action, result.action, "The sent proposal must name the teams actually chosen.");
  const amirTeamOffset = slots.indexOf("amir") < 2 ? 0 : 2;
  const amirPartner = slots.slice(amirTeamOffset, amirTeamOffset + 2).find(member => member !== "amir");
  const amirReply = result.replies.find(reply => reply.sender === "amir");
  assert.ok(amirReply, "Amir responds to every arrangement.");
  if (amirPartner !== "you") {
    assert.ok(result.replies.some(reply => reply.sender === amirPartner), "Amir's assigned partner replies to the proposal.");
    assert.ok(amirReply.text.includes(people[amirPartner].name), "Amir thanks the person actually assigned beside him.");
  } else {
    assert.match(amirReply.text, /berganding dengan saya/, "Amir acknowledges pairing with the participant.");
  }
}
assert.equal(arrangementOutcomes.size, 6, "Three partner combinations across two team positions have six distinct proposals.");

// Verify ethics profiles: pure deontology, pure utilitarianism, pure care, and balanced tie.
for (const lens of ["deontology", "utilitarianism", "care"]) {
  let s = flush(initialConversation());
  while (s.turn < steps.length) {
    const choice = steps[s.turn].choices.find(c => c.lens === lens);
    s = flush(reduce(s, { type: "send", text: choice.text, time }));
  }
  assert.equal(s.counts[lens], 6);
  assert.equal(getEthicsProfile(s.counts).id, lens);
}
assert.equal(getEthicsProfile({ deontology: 2, utilitarianism: 2, care: 2 }).id, "balanced");
assert.equal(getEthicsProfile({ deontology: 0, utilitarianism: 0, care: 0 }).id, "balanced");

// Every stage supports a neutral free-text fallback in the reducer.
for (const freeTurn of [-1, 0, 1, 2, 3, 4, 5]) {
  let s = flush(initialConversation());
  while (s.turn < steps.length) {
    const step = steps[s.turn];
    const useFreeText = freeTurn === -1 || freeTurn === s.turn;
    const text = useFreeText ? "Saya mahu terus berbincang." : step.choices[1].text;
    const sent = reduce(s, { type: "send", text, time });
    assert.deepEqual(sent.queue.slice(0, (useFreeText ? step.fallback : step.choices[1].replies).length), useFreeText ? step.fallback : step.choices[1].replies);
    s = flush(sent);
  }
  assert.equal(s.turn, 6);
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
  copy.endNote,
  ...steps.flatMap(step => [
    step.prompt.text,
    ...step.fallback.map(m => m.text),
    ...(step.transition ?? []).map(m => m.text),
    ...step.choices.flatMap(c => [c.text, ...c.replies.map(m => m.text)]),
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
console.log("PASS: contextual replies for every story message × 6 reactions, 8 semantic emoji replies, all 729 six-question routes, 18 distinct option responses, buddy gate for all choices and fallbacks, 24 team arrangements with six proposals, stable activity anchors, 3-lens ethics profile, 100% bilingual story/social/activity dictionary coverage, one Amir arrival after four debates, endings, Unicode limits, duplicate-send prevention, restart, viewport geometry, reduced motion, and no chat persistence.");

