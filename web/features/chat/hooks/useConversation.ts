"use client";
import { useEffect, useReducer, useState } from "react";
import { conversationReducer, getEthicsProfile, initialConversation, messageDelay } from "../lib/conversation";
import { pendingActivity } from "../lib/activities";
import type { ActivityId } from "../data/activities";
import { steps } from "../data/story";

function timeNow() {
  return new Intl.DateTimeFormat("ms-MY", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
}

export function useConversation() {
  const [state, dispatch] = useReducer(conversationReducer, undefined, initialConversation);
  const [completedActivities, setCompletedActivities] = useState<ActivityId[]>([]);
  const activity = pendingActivity(state, completedActivities);
  useEffect(() => {
    const next = state.queue[0];
    if (!next || activity) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => dispatch({ type: "advance", time: timeNow() }), messageDelay(next.text, next.sender === "system", reduced));
    return () => window.clearTimeout(timer);
  }, [state.queue, activity]);

  const pending = state.queue[0];
  return {
    messages: state.messages, turn: state.turn,
    typing: !activity && pending && pending.sender !== "system" ? pending.sender : null,
    activity,
    finishActivity: (id: ActivityId) => {
      if (activity !== id) return;
      setCompletedActivities(previous => previous.includes(id) ? previous : [...previous, id]);
    },
    busy: state.queue.length > 0,
    complete: state.turn === steps.length && state.queue.length === 0,
    step: steps[Math.min(activity ? state.turn - 1 : state.turn, steps.length - 1)], totalSteps: steps.length,
    hasAmir: state.messages.some(message => message.sender === "amir"),
    counts: state.counts,
    lastLens: state.lastLens,
    ethicsProfile: getEthicsProfile(state.counts),
    ending: state.ending,
    send: (text: string) => dispatch({ type: "send", text, time: timeNow() }),
    restart: () => { setCompletedActivities([]); dispatch({ type: "restart" }); },
  };
}
