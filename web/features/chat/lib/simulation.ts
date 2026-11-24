import { priorityItems, rankingOrderToId } from "../data/story";
import type {
  DecisionStageId,
  PriorityItemId,
  RankingChoiceId,
  SimulationAction,
  SimulationState,
} from "../types";

export const CHOICE_VIBRATION = [20, 45, 24];
export const DEFAULT_RANKING: [PriorityItemId, PriorityItemId, PriorityItemId] = [
  priorityItems[0].id,
  priorityItems[1].id,
  priorityItems[2].id,
];

export function isValidRankingOrder(order: unknown): order is [PriorityItemId, PriorityItemId, PriorityItemId] {
  if (!Array.isArray(order) || order.length !== 3) return false;
  const unique = new Set(order);
  return unique.size === 3 && unique.has("law") && unique.has("safety") && unique.has("rehab");
}

export function initialSimulation(): SimulationState {
  return {
    phase: "s1-blind",
    decisions: {
      "s1-blind": null,
      "s2-certificate": null,
      "s3-risk": null,
    },
    ranking: [...DEFAULT_RANKING] as [PriorityItemId, PriorityItemId, PriorityItemId],
    rankingSubmitted: false,
  };
}

const NEXT_PHASE: Record<DecisionStageId, SimulationState["phase"]> = {
  "s1-blind": "s2-certificate",
  "s2-certificate": "s3-risk",
  "s3-risk": "s4-ranking",
};

export function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  if (action.type === "restart") return initialSimulation();

  if (action.type === "decide") {
    if (state.phase !== "s1-blind" && state.phase !== "s2-certificate" && state.phase !== "s3-risk") {
      return state;
    }
    return {
      ...state,
      decisions: {
        ...state.decisions,
        [state.phase]: action.value,
      },
      phase: NEXT_PHASE[state.phase],
    };
  }

  if (action.type === "set-ranking") {
    if (state.phase !== "s4-ranking" || !isValidRankingOrder(action.order)) return state;
    return {
      ...state,
      ranking: [...action.order] as [PriorityItemId, PriorityItemId, PriorityItemId],
    };
  }

  if (action.type === "submit-ranking") {
    if (state.phase !== "s4-ranking") return state;
    return {
      ...state,
      rankingSubmitted: true,
      phase: "result",
    };
  }

  return state;
}

export function decisionChangeStatus(
  previous: SimulationState["decisions"][DecisionStageId],
  current: SimulationState["decisions"][DecisionStageId],
): "changed" | "same" | null {
  if (!previous || !current) return null;
  return previous === current ? "same" : "changed";
}

export function currentRankingChoiceId(state: SimulationState): RankingChoiceId {
  return rankingOrderToId(state.ranking);
}
