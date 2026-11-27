import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { importSource } from "./helpers.mjs";

const {
  CHOICE_VIBRATION,
  currentRankingChoiceId,
  decisionChangeStatus,
  initialSimulation,
  isValidRankingOrder,
  simulationReducer: reduce,
} = await importSource("features/chat/lib/simulation.ts");
const {
  copy,
  decisionStages,
  priorityItems,
  RANKING_PERMUTATIONS,
  rankingIdToOrder,
  rankingOrderToId,
  rankingStage,
} = await importSource("features/chat/data/story.ts");
const { viewportGeometry } = await importSource("features/chat/lib/viewport.ts");

assert.deepEqual(viewportGeometry({ height: 390, offsetTop: 210, baselineHeight: 844, inputFocused: true }), { height: 390, top: 210, keyboardOpen: true });
assert.deepEqual(viewportGeometry({ height: 844, offsetTop: 210, baselineHeight: 844, inputFocused: false }), { height: 844, top: 0, keyboardOpen: false });
assert.deepEqual(viewportGeometry({ height: 844, offsetTop: -10, baselineHeight: 844, inputFocused: true }), { height: 844, top: 0, keyboardOpen: false });
assert.equal(viewportGeometry({ height: 0, offsetTop: NaN, baselineHeight: 568, inputFocused: false }).height, 568);
assert.ok(Array.isArray(CHOICE_VIBRATION) && CHOICE_VIBRATION.length === 3);

// Stage structure: 3 binary decision loops + 1 three-item ranking stage.
assert.deepEqual(decisionStages.map(s => s.id), ["s1-blind", "s2-certificate", "s3-risk"]);
for (const stage of decisionStages) {
  assert.deepEqual(stage.choices.map(c => c.id), ["interview", "decline"]);
}
assert.equal(decisionStages[1].revealTone, "condition");
assert.equal(decisionStages[2].revealTone, "risk");
assert.equal(priorityItems.length, 3);
assert.equal(RANKING_PERMUTATIONS.length, 6);

// Explore all 2^3 * 6 = 48 full simulation paths.
const finishedSignatures = new Set();
const binaryValues = ["interview", "decline"];
for (const d1 of binaryValues) {
  for (const d2 of binaryValues) {
    for (const d3 of binaryValues) {
      for (const permId of RANKING_PERMUTATIONS) {
        let state = initialSimulation();
        assert.equal(state.phase, "s1-blind");
        // Ranking actions ignored before Stage 4.
        assert.equal(reduce(state, { type: "submit-ranking" }), state);
        state = reduce(state, { type: "decide", value: d1 });
        assert.equal(state.phase, "s2-certificate");
        assert.equal(state.decisions["s1-blind"], d1);
        state = reduce(state, { type: "decide", value: d2 });
        assert.equal(state.phase, "s3-risk");
        assert.equal(state.decisions["s2-certificate"], d2);
        assert.equal(decisionChangeStatus(d1, d2), d1 === d2 ? "same" : "changed");
        state = reduce(state, { type: "decide", value: d3 });
        assert.equal(state.phase, "s4-ranking");
        assert.equal(state.decisions["s3-risk"], d3);
        assert.equal(decisionChangeStatus(d2, d3), d2 === d3 ? "same" : "changed");
        // Binary decide ignored in Stage 4.
        assert.equal(reduce(state, { type: "decide", value: "interview" }), state);
        // Invalid ranking order rejected.
        assert.equal(reduce(state, { type: "set-ranking", order: ["law", "law", "rehab"] }), state);
        const order = rankingIdToOrder(permId);
        assert.equal(isValidRankingOrder(order), true);
        state = reduce(state, { type: "set-ranking", order });
        assert.equal(currentRankingChoiceId(state), permId);
        assert.equal(rankingOrderToId(order), permId);
        state = reduce(state, { type: "submit-ranking" });
        assert.equal(state.phase, "result");
        assert.equal(state.rankingSubmitted, true);
        // Subsequent actions after result are no-ops except restart.
        assert.equal(reduce(state, { type: "decide", value: "decline" }), state);
        assert.equal(reduce(state, { type: "submit-ranking" }), state);
        finishedSignatures.add(`${d1}|${d2}|${d3}|${permId}`);
        assert.deepEqual(reduce(state, { type: "restart" }), initialSimulation());
      }
    }
  }
}
assert.equal(finishedSignatures.size, 48, "All 48 decision + ranking routes must complete distinctly.");

// 100% bilingual dictionary coverage across story, scene cards, ranker, and summary.
const { lookupWord, tokenizeText } = await importSource("features/chat/data/dictionary.ts");
const uiTexts = [
  "Maklumat Terhad",
  "Pemohon: Bekas banduan",
  "Sijil Latihan Rasmi",
  "Latihan vokasional diiktiraf",
  "Amaran Risiko",
  "Kes kewangan · Jawatan juruwang",
  "Berubah",
  "Kekal",
  "Beri",
  "Tidak",
  "Keutamaan anda",
  copy.resultTitle,
  rankingStage.narrative,
  rankingStage.question,
  rankingStage.submitLabel,
  ...decisionStages.flatMap(s => [s.shortTitle, s.narrative, s.question, ...s.choices.flatMap(c => [c.label, c.subtitle])]),
  ...priorityItems.flatMap(p => [p.label, p.short, p.hint]),
];
for (const sentence of uiTexts) {
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

// Guard removal of stickers, ethics card, buddy activity, and WhatsApp chat files.
for (const path of [
  "app/admin", "app/print", "lib/session.ts", "components/ui",
  "public/stickers",
  "features/chat/data/stickers.ts",
  "features/chat/components/StickerDrawer.tsx",
  "features/chat/components/EthicsSticker.tsx",
  "features/chat/components/ReflectionCard.tsx",
  "features/chat/components/ChatActivity.tsx",
  "features/chat/components/MessageBubble.tsx",
]) {
  assert.equal(existsSync(path), false, `Expected removed path to not exist: ${path}`);
}

function inspect(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) inspect(path);
    else if (/\.tsx?$/.test(path)) assert.doesNotMatch(readFileSync(path, "utf8"), /\b(localStorage|sessionStorage|indexedDB|fetch)\b/, path);
  }
}
inspect("features/chat");
console.log("PASS: 4-stage visual simulation (3 binary loops + 3-item ranker), all 48 paths, 100% bilingual dictionary coverage, viewport geometry, removed WhatsApp/sticker/ethics surfaces, and no chat persistence.");
