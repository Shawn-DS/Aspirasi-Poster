import {
  decisionStages,
  priorityItems,
  RANKING_PERMUTATIONS,
  rankingIdLabel,
  rankingIdToOrder,
  rankingStage,
} from "../chat/data/story";
import type { PriorityItemId, RankingChoiceId } from "../chat/types";

// Bump this before changing question IDs, option meanings or the published survey.
export const STATISTICS_VERSION = "employer-visual-v1";

export const statisticsCatalog = [
  ...decisionStages.map(stage => ({
    id: stage.id,
    title: stage.badge,
    shortTitle: stage.shortTitle,
    choices: stage.choices.map(choice => ({
      id: choice.id,
      label: choice.label,
      short: choice.id === "interview" ? "Beri temu duga" : "Tidak beri",
    })),
  })),
  {
    id: rankingStage.id,
    title: rankingStage.badge,
    shortTitle: rankingStage.shortTitle,
    choices: RANKING_PERMUTATIONS.map(id => ({
      id,
      label: rankingIdLabel(id),
      short: rankingIdLabel(id),
    })),
  },
];

export type StatisticsEvent = { version: typeof STATISTICS_VERSION; eventId: string } & (
  | { kind: "start" | "complete" }
  | { kind: "answer"; questionId: string; choiceId: string }
);

export type RankingItemStats = {
  id: PriorityItemId;
  label: string;
  short: string;
  firstCount: number;
  secondCount: number;
  thirdCount: number;
  total: number;
  averageRank: number | null;
};

export type StatisticsSnapshot = {
  version: typeof STATISTICS_VERSION;
  started: number;
  completed: number;
  questions: Array<{
    id: string;
    title: string;
    shortTitle: string;
    total: number;
    choices: Array<{ id: string; label: string; short: string; count: number }>;
  }>;
  rankingSummary: RankingItemStats[];
};

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidStatisticsChoice(questionId: unknown, choiceId: unknown): boolean {
  const question = statisticsCatalog.find(item => item.id === questionId);
  return Boolean(question?.choices.some(choice => choice.id === choiceId));
}

export function statisticsEventSlotKey(event: StatisticsEvent) {
  return event.kind === "answer" ? `answer:${event.questionId}` : event.kind;
}

export function parseStatisticsEvent(value: unknown): StatisticsEvent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (
    input.version !== STATISTICS_VERSION ||
    typeof input.eventId !== "string" ||
    !UUID_V4_PATTERN.test(input.eventId)
  ) {
    return null;
  }
  const keys = ["version", "eventId", "kind"];
  if (input.kind === "answer") {
    keys.push("questionId", "choiceId");
    if (!isValidStatisticsChoice(input.questionId, input.choiceId)) return null;
  } else if (input.kind !== "start" && input.kind !== "complete") {
    return null;
  }
  if (Object.keys(input).some(key => !keys.includes(key))) return null;
  return input as StatisticsEvent;
}

export function summarizeRankingCounts(
  permutationChoices: ReadonlyArray<{ id: string; count: number }>,
): RankingItemStats[] {
  const tally: Record<PriorityItemId, { firstCount: number; secondCount: number; thirdCount: number }> = {
    law: { firstCount: 0, secondCount: 0, thirdCount: 0 },
    safety: { firstCount: 0, secondCount: 0, thirdCount: 0 },
    rehab: { firstCount: 0, secondCount: 0, thirdCount: 0 },
  };
  let total = 0;
  for (const entry of permutationChoices) {
    if (!RANKING_PERMUTATIONS.includes(entry.id as RankingChoiceId) || entry.count <= 0) continue;
    const [first, second, third] = rankingIdToOrder(entry.id as RankingChoiceId);
    tally[first].firstCount += entry.count;
    tally[second].secondCount += entry.count;
    tally[third].thirdCount += entry.count;
    total += entry.count;
  }
  return priorityItems.map(item => {
    const t = tally[item.id];
    const weighted = t.firstCount * 1 + t.secondCount * 2 + t.thirdCount * 3;
    return {
      id: item.id,
      label: item.label,
      short: item.short,
      firstCount: t.firstCount,
      secondCount: t.secondCount,
      thirdCount: t.thirdCount,
      total,
      averageRank: total > 0 ? Math.round((weighted / total) * 100) / 100 : null,
    };
  });
}
