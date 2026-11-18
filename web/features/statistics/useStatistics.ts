"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createStatisticsClient, deliverStatistics, newStatisticsEventId, type StatisticsSyncState } from "./client";

export function useStatistics(joined: boolean) {
  const client = useRef<ReturnType<typeof createStatisticsClient> | null>(null);
  const [state, setState] = useState<StatisticsSyncState>({ pending: 0, syncing: false, error: false, revision: 0 });
  useEffect(() => {
    let storage: Storage | undefined;
    try { storage = window.sessionStorage; } catch { /* Use memory when unavailable. */ }
    client.current ??= createStatisticsClient({ storage, deliver: deliverStatistics, uuid: newStatisticsEventId });
    return client.current.subscribe(setState);
  }, []);
  useEffect(() => {
    if (!joined) return;
    client.current?.start();
    const retry = () => { void client.current?.retry(); };
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [joined]);
  const answer = useCallback((questionId: string, choiceId: string) => client.current?.answer(questionId, choiceId), []);
  const complete = useCallback(() => client.current?.complete(), []);
  const retry = useCallback(() => { void client.current?.retry(); }, []);
  return { state, answer, complete, retry };
}
