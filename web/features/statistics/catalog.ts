import { ethicsLensMeta, steps } from "../chat/data/story";
import type { EthicsLens } from "../chat/types";

// Bump this before changing question IDs, option meanings or the published survey.
export const STATISTICS_VERSION = "ethics-six-v1";

export const statisticsCatalog = steps.map(step => ({
  id: step.id,
  title: step.title,
  choices: step.choices.map(choice => ({ id: choice.id, label: choice.text, lens: choice.lens })),
}));

export const statisticsLenses = (Object.keys(ethicsLensMeta) as EthicsLens[]).map(id => ({
  id,
  label: ethicsLensMeta[id].name,
}));

export type StatisticsEvent = { version: typeof STATISTICS_VERSION; eventId: string } & (
  | { kind: "start" | "complete" }
  | { kind: "answer"; questionId: string; choiceId: string }
);

export type StatisticsSnapshot = {
  version: typeof STATISTICS_VERSION;
  started: number;
  completed: number;
  questions: Array<{
    id: string;
    title: string;
    total: number;
    choices: Array<{ id: string; label: string; lens: EthicsLens; count: number }>;
  }>;
  lenses: Array<{ id: EthicsLens; label: string; count: number }>;
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
