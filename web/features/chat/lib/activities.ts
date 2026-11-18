import type { ActivityId } from "../data/activities";
import { steps } from "../data/story";
import type { ChatMessage, ConversationState } from "../types";

export function activityAnchors(messages: ChatMessage[]): Partial<Record<ActivityId, number>> {
  const anchors: Partial<Record<ActivityId, number>> = {};
  const activityTurn = steps.findIndex(step => step.id === "community-activity") + 1;
  let answers = 0;
  for (const message of messages) {
    if (message.sender === "you") {
      answers++;
    } else if (answers === activityTurn && anchors.buddy === undefined) {
      anchors.buddy = message.id;
    }
  }
  return anchors;
}

// Pause only at authored story boundaries; the six choices and scores
// still belong to the conversation reducer, independently of attachment gestures.
export function pendingActivity(state: ConversationState, completed: readonly ActivityId[]): ActivityId | null {
  const next = state.queue[0];
  if (!next) return null;
  const activityTurn = steps.findIndex(step => step.id === "community-activity") + 1;
  const nextPrompt = steps[activityTurn]?.prompt;
  if (activityTurn > 0 && state.turn === activityTurn && next.text === nextPrompt?.text && next.sender === nextPrompt.sender && !completed.includes("buddy")) return "buddy";
  return null;
}
