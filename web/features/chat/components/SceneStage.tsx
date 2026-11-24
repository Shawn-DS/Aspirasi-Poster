"use client";
import type { WordLookupResult } from "../data/dictionary";
import type { DecisionStageId, DecisionValue, SimulationPhase } from "../types";
import TranslatableText from "./TranslatableText";

const DECISION_SHORT: Record<DecisionValue, string> = {
  interview: "Beri temu duga",
  decline: "Tidak beri",
};

const SCENE_ART: Record<Exclude<SimulationPhase, "result">, string> = {
  "s1-blind": "/art/scene-s1.webp?v=2",
  "s2-certificate": "/art/scene-s2.webp",
  "s3-risk": "/art/scene-s3.webp",
  "s4-ranking": "/art/scene-s4.webp",
};

function HandDrawnBadgeIcon({ kind }: { kind: "question" | "award" | "risk" }) {
  if (kind === "question") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.2 9.1c.2-2 1.8-3.3 3.7-3.1 1.9.1 3.3 1.5 3.1 3.4-.2 1.6-1.4 2.3-2.6 3.1-.8.5-1.1 1.1-1.1 2" />
        <circle cx="12.3" cy="18.2" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (kind === "award") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="9.5" r="5.3" />
        <path d="M9 14.3 L7.6 20.6 L12 18.2 L16.4 20.6 L15 14.3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.8 L21 19.3 H3 Z" />
      <line x1="12" y1="9.6" x2="12" y2="14" />
      <circle cx="12" cy="16.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StageClueBanner({
  phase,
  activeWordId,
  onSelectWord,
}: {
  phase: DecisionStageId;
  activeWordId?: string | null;
  onSelectWord: (id: string, lookup: WordLookupResult, target: HTMLElement) => void;
}) {
  if (phase === "s1-blind") {
    return (
      <div key="clue-blind" className="scene-float-card is-neutral">
        <span className="scene-card-icon"><HandDrawnBadgeIcon kind="question" /></span>
        <div className="scene-card-copy">
          <em className="scene-card-tag">PETUNJUK AWAL</em>
          <strong>
            <TranslatableText text="Maklumat Terhad" prefixId="sc-s1-t" activeId={activeWordId} onSelectWord={onSelectWord} />
          </strong>
          <span>
            <TranslatableText text="Pemohon: Bekas banduan" prefixId="sc-s1-d" activeId={activeWordId} onSelectWord={onSelectWord} />
          </span>
        </div>
      </div>
    );
  }

  if (phase === "s2-certificate") {
    return (
      <div key="clue-cert" className="scene-float-card is-condition">
        <span className="scene-card-icon"><HandDrawnBadgeIcon kind="award" /></span>
        <div className="scene-card-copy">
          <em className="scene-card-tag">SYARAT BAHARU</em>
          <strong>
            <TranslatableText text="Sijil Latihan Rasmi" prefixId="sc-s2-t" activeId={activeWordId} onSelectWord={onSelectWord} />
          </strong>
          <span>
            <TranslatableText text="Latihan vokasional diiktiraf" prefixId="sc-s2-d" activeId={activeWordId} onSelectWord={onSelectWord} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div key="clue-risk" className="scene-float-card is-risk">
      <span className="scene-card-icon"><HandDrawnBadgeIcon kind="risk" /></span>
      <div className="scene-card-copy">
        <em className="scene-card-tag">PERHATIAN</em>
        <strong>
          <TranslatableText text="Amaran Risiko" prefixId="sc-s3-t" activeId={activeWordId} onSelectWord={onSelectWord} />
        </strong>
        <span>
          <TranslatableText text="Kes kewangan · Jawatan juruwang" prefixId="sc-s3-d" activeId={activeWordId} onSelectWord={onSelectWord} />
        </span>
      </div>
    </div>
  );
}

export default function SceneStage({
  phase,
  decisions,
}: {
  phase: Exclude<SimulationPhase, "result">;
  decisions: Record<DecisionStageId, DecisionValue | null>;
}) {
  const s1Choice = decisions["s1-blind"];
  const s2Choice = decisions["s2-certificate"];
  const s3Choice = decisions["s3-risk"];
  const s2Changed = s1Choice && s2Choice && s1Choice !== s2Choice;
  const s3Changed = s2Choice && s3Choice && s2Choice !== s3Choice;

  return (
    <div className={`scene-stage phase-${phase}`} aria-label="Ilustrasi suasana temu duga">
      <img key={phase} src={SCENE_ART[phase]} alt="" className="scene-art-img" />
      <div className="scene-paper-vignette" aria-hidden="true" />
      <div className="scene-preload" aria-hidden="true">
        {Object.values(SCENE_ART).map(src => (
          <img key={src} src={src} alt="" />
        ))}
      </div>

      {/* Top-left carried clue chip on Risk stage */}
      {phase === "s3-risk" && (
        <div className="scene-mini-chip is-condition" aria-hidden="true">
          <HandDrawnBadgeIcon kind="award" />
          <span>Sijil latihan</span>
        </div>
      )}

      {/* Top Overlay: Compact Loop Memory Pill */}
      {(s1Choice || s2Choice) && phase !== "s1-blind" && (
        <div className="scene-history-pill" role="status">
          {phase === "s2-certificate" && s1Choice && (
            <>
              <span>Pilihan tadi:</span>
              <strong className={`choice-tag is-${s1Choice}`}>{DECISION_SHORT[s1Choice]}</strong>
            </>
          )}
          {phase === "s3-risk" && s1Choice && s2Choice && (
            <>
              <span>Pilihan tadi:</span>
              <strong className={`choice-tag is-${s2Choice}`}>{DECISION_SHORT[s2Choice]}</strong>
              <em className={s2Changed ? "delta-changed" : "delta-same"}>
                {s2Changed ? "Berubah" : "Kekal"}
              </em>
            </>
          )}
          {phase === "s4-ranking" && s2Choice && s3Choice && (
            <>
              <span>Pilihan tadi:</span>
              <strong className={`choice-tag is-${s3Choice}`}>{DECISION_SHORT[s3Choice]}</strong>
              <em className={s3Changed ? "delta-changed" : "delta-same"}>
                {s3Changed ? "Berubah" : "Kekal"}
              </em>
            </>
          )}
        </div>
      )}
    </div>
  );
}
