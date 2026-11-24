export type DecisionValue = "interview" | "decline";
export type PriorityItemId = "law" | "safety" | "rehab";
export type RankingChoiceId =
  | "law-safety-rehab"
  | "law-rehab-safety"
  | "safety-law-rehab"
  | "safety-rehab-law"
  | "rehab-law-safety"
  | "rehab-safety-law";

export type DecisionStageId = "s1-blind" | "s2-certificate" | "s3-risk";
export type QuestionId = DecisionStageId | "s4-ranking";
export type SimulationPhase = DecisionStageId | "s4-ranking" | "result";

export type DecisionChoiceOption = {
  id: DecisionValue;
  label: string;
  subtitle: string;
};

export type DecisionStage = {
  id: DecisionStageId;
  stepNumber: 1 | 2 | 3;
  badge: string;
  shortTitle: string;
  revealTag?: string;
  revealDetail?: string;
  revealTone?: "condition" | "risk";
  narrative: string;
  question: string;
  choices: [DecisionChoiceOption, DecisionChoiceOption];
};

export type PriorityItem = {
  id: PriorityItemId;
  label: string;
  short: string;
  hint: string;
};

export type SimulationState = {
  phase: SimulationPhase;
  decisions: Record<DecisionStageId, DecisionValue | null>;
  ranking: [PriorityItemId, PriorityItemId, PriorityItemId];
  rankingSubmitted: boolean;
};

export type SimulationAction =
  | { type: "decide"; value: DecisionValue }
  | { type: "set-ranking"; order: [PriorityItemId, PriorityItemId, PriorityItemId] }
  | { type: "submit-ranking" }
  | { type: "restart" };
