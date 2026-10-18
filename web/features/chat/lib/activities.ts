import type { ActivityId } from "../data/activities";
import { steps } from "../data/story";
import type { ChatMessage, ConversationState } from "../types";

export function activityAnchors(messages: ChatMessage[]): Partial<Record<ActivityId, number>> {
  const anchors: Partial<Record<ActivityId, number>> = {};
  let answers = 0;
  for (const message of messages) {
    if (message.sender === "you") {
      answers++;
      if (answers === 7) anchors.evidence = message.id;
    } else if (answers === 4 && anchors.buddy === undefined) {
      anchors.buddy = message.id;
    }
  }
  return anchors;
}

// Pause only at authored story boundaries; the original eight choices and scores
// still belong to the conversation reducer, independently of attachment gestures.
export function pendingActivity(state: ConversationState, completed: readonly ActivityId[]): ActivityId | null {
  const next = state.queue[0];
  if (!next) return null;
  if (state.turn === 4 && next.text === steps[4].prompt.text && !completed.includes("buddy")) return "buddy";
  if (state.turn === 7 && state.messages.at(-1)?.sender === "you" && !completed.includes("evidence")) return "evidence";
  return null;
}
