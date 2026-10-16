"use client";
import { useEffect, useReducer } from "react";
import { conversationReducer, getEthicsProfile, initialConversation, messageDelay } from "../lib/conversation";
import { steps } from "../data/story";

function timeNow() {
  return new Intl.DateTimeFormat("ms-MY", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
}

export function useConversation() {
  const [state, dispatch] = useReducer(conversationReducer, undefined, initialConversation);
  useEffect(() => {
    const next = state.queue[0];
    if (!next) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => dispatch({ type: "advance", time: timeNow() }), messageDelay(next.text, next.sender === "system", reduced));
    return () => window.clearTimeout(timer);
  }, [state.queue]);

  const pending = state.queue[0];
  return {
    messages: state.messages, turn: state.turn,
    typing: pending && pending.sender !== "system" ? pending.sender : null,
    busy: state.queue.length > 0,
    complete: state.turn === steps.length && state.queue.length === 0,
    step: steps[Math.min(state.turn, steps.length - 1)], totalSteps: steps.length,
    hasAmir: state.messages.some(message => message.sender === "amir"),
    counts: state.counts,
    ethicsProfile: getEthicsProfile(state.counts),
    ending: state.ending,
    send: (text: string) => dispatch({ type: "send", text, time: timeNow() }),
    restart: () => dispatch({ type: "restart" }),
  };
}
