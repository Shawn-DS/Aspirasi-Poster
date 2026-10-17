import { ethicsProfiles, opening, openingReflections, steps } from "../data/story";
import type { ConversationAction, ConversationState, EthicsCounts, EthicsLens, EthicsProfile } from "../types";

export const MAX_MESSAGE_LENGTH = 500;
const LENSES: EthicsLens[] = ["deontology", "utilitarianism", "care"];

export const LENS_VIBRATION: Record<EthicsLens, number | number[]> = {
  deontology: 45,
  utilitarianism: [22, 55, 22, 55, 22],
  care: [28, 80, 42],
};

export function getEthicsProfile(counts: EthicsCounts): EthicsProfile {
  const max = Math.max(counts.deontology, counts.utilitarianism, counts.care);
  if (max === 0) return ethicsProfiles.balanced;
  const top = LENSES.filter(lens => counts[lens] === max);
  return top.length === 1 ? ethicsProfiles[top[0]] : ethicsProfiles.balanced;
}

export function initialConversation(): ConversationState {
  return {
    messages: [],
    queue: [...opening],
    turn: 0,
    nextId: 1,
    firstChoice: null,
    counts: { deontology: 0, utilitarianism: 0, care: 0 },
    lastLens: null,
    ending: null,
  };
}

export function conversationReducer(state: ConversationState, action: ConversationAction): ConversationState {
  if (action.type === "restart") return initialConversation();
  if (action.type === "advance") {
    const next = state.queue[0];
    if (!next) return state;
    return { ...state, messages: [...state.messages, { ...next, id: state.nextId, time: action.time }], queue: state.queue.slice(1), nextId: state.nextId + 1 };
  }
  const text = action.text.trim();
  if (state.queue.length || state.turn >= steps.length || !text || Array.from(text).length > MAX_MESSAGE_LENGTH) return state;
  const turn = state.turn + 1;
  const step = steps[state.turn];
  const choice = step.choices.find(option => option.text === text);
  const firstChoice = state.turn === 0 ? choice?.id ?? null : state.firstChoice;
  const counts = choice ? { ...state.counts, [choice.lens]: state.counts[choice.lens] + 1 } : state.counts;
  const queue = [...(choice?.replies ?? step.fallback), ...(step.transition ?? [])];
  if (steps[turn]) queue.push(steps[turn].prompt);
  else if (firstChoice && openingReflections[firstChoice]) queue.push(openingReflections[firstChoice]);
  return {
    ...state,
    turn,
    firstChoice,
    counts,
    lastLens: choice?.lens ?? null,
    ending: choice?.ending ?? null,
    nextId: state.nextId + 1,
    messages: [...state.messages, { id: state.nextId, sender: "you", text, time: action.time }],
    queue,
  };
}

export function messageDelay(text: string, isSystem: boolean, reducedMotion: boolean) {
  if (reducedMotion) return 180;
  return isSystem ? 400 : 650 + Math.min(1100, text.length * 7);
}
