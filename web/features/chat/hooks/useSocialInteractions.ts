"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { reactionReply, stickerReply } from "../lib/socialReplies";
import type { ChatMessage, MessageDraft } from "../types";

export interface SocialEntry {
  id: number;
  afterMessageId: number;
  time: string;
  stickerId?: string;
  autoReactEmoji?: string;
  reply?: MessageDraft;
  quote?: MessageDraft;
  reaction?: string;
}
const clock = () => new Intl.DateTimeFormat("ms-MY", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kuala_Lumpur" }).format(new Date());

// Presentation-only events: no changes to dilemma answers, counts or progress.
export function useSocialInteractions(messages: ChatMessage[]) {
  const [entries, setEntries] = useState<SocialEntry[]>([]);
  const latest = useRef(messages);
  const sequence = useRef(0);
  const pending = useRef(new Map<string, number>());
  const delivered = useRef(new Set<string>());
  const lastSticker = useRef(0);
  useLayoutEffect(() => { latest.current = messages; }, [messages]);
  const clearTimers = useCallback(() => {
    pending.current.forEach(timer => window.clearTimeout(timer));
    pending.current.clear();
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const react = useCallback((source: ChatMessage, emoji: string | null) => {
    const timerKey = `reaction-${source.id}`;
    const previous = pending.current.get(timerKey);
    if (previous !== undefined) window.clearTimeout(previous);
    pending.current.delete(timerKey);
    const reply = reactionReply(source, emoji);
    const signature = `${source.id}:${emoji}`;
    if (!reply || delivered.current.has(signature)) return;
    pending.current.set(timerKey, window.setTimeout(() => {
      pending.current.delete(timerKey);
      const anchor = latest.current.at(-1);
      if (!anchor) return;
      delivered.current.add(signature);
      const entry = { id: ++sequence.current, afterMessageId: anchor.id, time: clock(), reply, quote: source, reaction: emoji! };
      setEntries(prev => [...prev, entry]);
    }, 420));
  }, []);

  const sendSticker = useCallback((stickerId: string) => {
    if (Date.now() - lastSticker.current < 650) return;
    const anchor = latest.current.at(-1);
    const neighbour = [...latest.current].reverse().find(message => message.sender !== "you" && message.sender !== "system");
    if (!anchor || !neighbour) return;
    const response = stickerReply(neighbour, stickerId);
    if (!response) return;
    lastSticker.current = Date.now();
    const entryId = ++sequence.current;
    const timerKey = `emoji-${entryId}`;
    setEntries(prev => [...prev, { id: entryId, afterMessageId: anchor.id, time: clock(), stickerId }]);
    pending.current.set(timerKey, window.setTimeout(() => {
      pending.current.delete(timerKey);
      const latestAnchor = latest.current.at(-1);
      if (!latestAnchor) return;
      const replyEntry = { id: ++sequence.current, afterMessageId: latestAnchor.id, time: clock(), reply: response.message, reaction: response.emoji };
      setEntries(prev => [
        ...prev.map(item => item.id === entryId ? { ...item, autoReactEmoji: response.emoji } : item),
        replyEntry,
      ]);
    }, 420));
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    delivered.current.clear();
    lastSticker.current = 0;
    setEntries([]);
  }, [clearTimers]);
  const byAnchor = useMemo(() => {
    const grouped = new Map<number, SocialEntry[]>();
    for (const entry of entries) {
      const bucket = grouped.get(entry.afterMessageId) ?? [];
      bucket.push(entry);
      grouped.set(entry.afterMessageId, bucket);
    }
    return grouped;
  }, [entries]);
  return { byAnchor, count: entries.length, lastIsReply: Boolean(entries.at(-1)?.reply), react, sendSticker, reset };
}
