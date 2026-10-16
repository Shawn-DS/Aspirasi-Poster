import { opening, openingReflections, steps } from "../data/story";
import type { ConversationAction, ConversationState } from "../types";

export const MAX_MESSAGE_LENGTH = 500;

export function initialConversation(): ConversationState {
  return { messages: [], queue: [...opening], turn: 0, nextId: 1, firstChoice: null, ending: null };
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
  const queue = [...(choice?.replies ?? step.fallback), ...(step.transition ?? [])];
  if (steps[turn]) queue.push(steps[turn].prompt);
  else if (firstChoice && openingReflections[firstChoice]) queue.push(openingReflections[firstChoice]);
  return { ...state, turn, firstChoice, ending: choice?.ending ?? null, nextId: state.nextId + 1,
    messages: [...state.messages, { id: state.nextId, sender: "you", text, time: action.time }],
    queue,
  };
}

export function messageDelay(text: string, isSystem: boolean, reducedMotion: boolean) {
  if (reducedMotion) return 180;
  return isSystem ? 400 : 650 + Math.min(1100, text.length * 7);
}
