"use client";
import { useCallback, useReducer } from "react";
import { initialSimulation, simulationReducer } from "../lib/simulation";
import type { DecisionValue, PriorityItemId } from "../types";

export function useSimulation() {
  const [state, dispatch] = useReducer(simulationReducer, undefined, initialSimulation);

  const decide = useCallback((value: DecisionValue) => {
    dispatch({ type: "decide", value });
  }, []);

  const setRanking = useCallback((order: [PriorityItemId, PriorityItemId, PriorityItemId]) => {
    dispatch({ type: "set-ranking", order });
  }, []);

  const submitRanking = useCallback(() => {
    dispatch({ type: "submit-ranking" });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: "restart" });
  }, []);

  return {
    state,
    decide,
    setRanking,
    submitRanking,
    restart,
    complete: state.phase === "result",
  };
}
