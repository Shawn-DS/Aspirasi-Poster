"use client";
import type { WordLookupResult } from "../data/dictionary";
import { copy, priorityItemMap } from "../data/story";
import { decisionChangeStatus } from "../lib/simulation";
import type { DecisionValue, PriorityItemId, SimulationState } from "../types";
import TranslatableText from "./TranslatableText";

const CHOICE_SHORT: Record<DecisionValue, string> = {
  interview: "Beri",
  decline: "Tidak",
};

export default function DecisionSummaryCard({
  decisions,
  ranking,
  activeWordId,
  onSelectWord,
}: {
  decisions: SimulationState["decisions"];
  ranking: [PriorityItemId, PriorityItemId, PriorityItemId];
  activeWordId?: string | null;
  onSelectWord: (id: string, lookup: WordLookupResult, target: HTMLElement) => void;
}) {
  const s1 = decisions["s1-blind"];
  const s2 = decisions["s2-certificate"];
  const s3 = decisions["s3-risk"];
  const changedAny = decisionChangeStatus(s1, s2) === "changed" || decisionChangeStatus(s2, s3) === "changed";

  const rounds = [
    { key: "s1", label: "Awal", value: s1 },
    { key: "s2", label: "+ Sijil", value: s2 },
    { key: "s3", label: "+ Risiko", value: s3 },
  ];

  return (
    <section className="decision-summary-card" aria-labelledby="decision-summary-title">
      <div className="decision-summary-head">
        <h2 id="decision-summary-title">
          <TranslatableText
            text={copy.resultTitle}
            prefixId="sum-title"
            activeId={activeWordId}
            onSelectWord={onSelectWord}
          />
        </h2>
        <span className={`decision-change-badge${changedAny ? " is-changed" : " is-steady"}`}>
          <TranslatableText
            text={changedAny ? "Berubah" : "Kekal"}
            prefixId="sum-badge"
            activeId={activeWordId}
            onSelectWord={onSelectWord}
          />
        </span>
      </div>

      <ol className="decision-journey" aria-label="Pilihan Fasa 1 hingga 3">
        {rounds.map((round, index) => (
          <li key={round.key} className={`decision-step variant-${round.value ?? "neutral"}`}>
            <span className="decision-step-label">{round.label}</span>
            <strong className="decision-step-choice">
              <TranslatableText
                text={round.value ? CHOICE_SHORT[round.value] : "-"}
                prefixId={`sum-choice-${index}`}
                activeId={activeWordId}
                onSelectWord={onSelectWord}
              />
            </strong>
          </li>
        ))}
      </ol>

      <div className="decision-ranking-summary">
        <span className="decision-ranking-kicker">
          <TranslatableText text="Keutamaan anda" prefixId="sum-rank-hdr" activeId={activeWordId} onSelectWord={onSelectWord} />
        </span>
        <ol className="decision-ranking-pills">
          {ranking.map((itemId, index) => (
            <li key={itemId} className={`summary-rank-row rank-${index + 1}`}>
              <span className="summary-rank-num" aria-hidden="true">{index + 1}</span>
              <strong className="summary-rank-label">
                <TranslatableText
                  text={priorityItemMap[itemId].short}
                  prefixId={`sum-rank-${itemId}`}
                  activeId={activeWordId}
                  onSelectWord={onSelectWord}
                />
              </strong>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
