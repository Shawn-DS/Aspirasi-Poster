"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Briefcase,
  Check,
  Clock3,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { WordLookupResult } from "./data/dictionary";
import { copy, decisionStages, project, rankingOrderToId, rankingStage } from "./data/story";
import { CHOICE_VIBRATION } from "./lib/simulation";
import { sound } from "./lib/sound";
import { useSimulation } from "./hooks/useSimulation";
import { useChatViewport } from "./hooks/useChatViewport";
import SceneStage, { StageClueBanner } from "./components/SceneStage";
import PriorityRanker from "./components/PriorityRanker";
import DecisionSummaryCard from "./components/DecisionSummaryCard";
import WordPopover from "./components/WordPopover";
import TranslatableText, { type ActiveWordState } from "./components/TranslatableText";
import type { DecisionValue, PriorityItemId } from "./types";
import StatisticsResult from "../statistics/StatisticsResult";
import type { StatisticsSyncState } from "../statistics/client";

export default function ChatSimulator({
  onAnswer,
  onComplete,
  statisticsState,
  onRetryStatistics,
}: {
  onAnswer: (questionId: string, choiceId: string) => void;
  onComplete: () => void;
  statisticsState: StatisticsSyncState;
  onRetryStatistics: () => void;
}) {
  const sim = useSimulation();
  const [muted, setMuted] = useState(() => sound.isMuted());
  const [activeWord, setActiveWord] = useState<ActiveWordState | null>(null);
  const [dictMode, setDictMode] = useState(false);
  const frame = useRef<HTMLElement>(null);
  const root = useRef<HTMLElement>(null);
  const resultScroller = useRef<HTMLDivElement>(null);
  useChatViewport(root);

  const { state } = sim;
  const activeDecisionStage = decisionStages.find(stage => stage.id === state.phase) ?? null;
  const stepIndex =
    state.phase === "s1-blind"
      ? 1
      : state.phase === "s2-certificate"
        ? 2
        : state.phase === "s3-risk"
          ? 3
          : state.phase === "s4-ranking"
            ? 4
            : 5;

  useEffect(() => {
    sound.startBgm(sim.complete ? "complete" : "thinking");
  }, [sim.complete]);

  useEffect(() => {
    return () => sound.stopBgm();
  }, []);

  useEffect(() => {
    // Emit accepted answers once per stage; duplicate taps are ignored by state machine.
    for (const stage of decisionStages) {
      const value = state.decisions[stage.id];
      if (value) onAnswer(stage.id, value);
    }
    if (state.rankingSubmitted) {
      onAnswer(rankingStage.id, rankingOrderToId(state.ranking));
      onComplete();
    }
  }, [state.decisions, state.ranking, state.rankingSubmitted, onAnswer, onComplete]);

  useEffect(() => {
    if (state.phase === "result" && resultScroller.current) {
      resultScroller.current.scrollTop = 0;
    }
  }, [state.phase]);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    sound.setMuted(next);
    if (!next) sound.startBgm(sim.complete ? "complete" : "thinking");
  }

  const selectWord = useCallback((id: string, lookup: WordLookupResult, target: HTMLElement) => {
    const frameEl = frame.current;
    if (!frameEl) return;
    const frameRect = frameEl.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const rawX = targetRect.left - frameRect.left + targetRect.width / 2;
    const minX = 128;
    const maxX = Math.max(minX, frameRect.width - 128);
    const x = Math.min(maxX, Math.max(minX, rawX));
    const y = targetRect.top - frameRect.top;
    const bottom = targetRect.bottom - frameRect.top;
    const placeBelow = y < 150;
    setActiveWord(previous => (previous?.id === id ? null : { id, lookup, x, y, bottom, placeBelow }));
  }, []);

  function triggerHaptic() {
    if (
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      typeof navigator !== "undefined" &&
      "vibrate" in navigator
    ) {
      try {
        navigator.vibrate(CHOICE_VIBRATION);
      } catch {}
    }
  }

  function handleDecide(value: DecisionValue) {
    if (dictMode) return;
    setActiveWord(null);
    sound.startBgm("thinking");
    sound.playChoiceSfx();
    triggerHaptic();
    sim.decide(value);
  }

  function handleRankingChange(next: [PriorityItemId, PriorityItemId, PriorityItemId]) {
    setActiveWord(null);
    sound.playMessagePop();
    sim.setRanking(next);
  }

  function handleSubmitRanking() {
    setActiveWord(null);
    setDictMode(false);
    sound.playChoiceSfx();
    triggerHaptic();
    sim.submitRanking();
  }

  function handleRestart() {
    setActiveWord(null);
    setDictMode(false);
    sound.startBgm("thinking");
    sim.restart();
  }

  return (
    <main className="experience" ref={root}>
      <section className="story-panel" aria-labelledby="project-title">
        <a className="project-brand" href="/">
          <span><Briefcase size={20} /></span>
          peluang<span className="brand-light">kedua</span>
          <i />
        </a>
        <div className="story-heading">
          <p className="eyebrow"><span />{copy.badge}</p>
          <div className="story-title-group">
            <h1 id="project-title" className="story-main-title">{copy.title}</h1>
            <p className="story-sub-title">{copy.titleAccent}</p>
          </div>
          <p className="story-description">{copy.intro}</p>
          <div className="duration"><Clock3 size={16} />{copy.duration}<span />{copy.privacy}</div>
        </div>
        <div className="story-values">
          {copy.stages.map((label, index) => (
            <span key={label}><i>{`0${index + 1}`}</i>{label}</span>
          ))}
        </div>
        <div className="project-note"><Briefcase size={22} /><p>{project.subject}</p></div>
        <p className="project-footer">{copy.footer}</p>
      </section>

      <section
        className="sim-frame"
        ref={frame}
        aria-label={project.groupName}
        onClick={() => {
          if (activeWord) setActiveWord(null);
        }}
      >
        <header className="sim-topbar">
          <div className="sim-topbar-brand">
            <strong>{project.groupName}</strong>
            <span>{state.phase === "result" ? copy.resultBadge : `Fasa ${stepIndex} / 4`}</span>
          </div>
          <div className="sim-topbar-actions">
            <button
              type="button"
              className={`sim-top-pill${dictMode ? " is-active" : ""}`}
              onClick={e => {
                e.stopPropagation();
                setDictMode(v => !v);
                setActiveWord(null);
              }}
              aria-pressed={dictMode}
              title="Mod terjemahan perkataan"
            >
              <BookOpen size={13} aria-hidden="true" />
              <span>Translate</span>
            </button>
            <button
              type="button"
              className="sim-icon-btn"
              onClick={toggleMute}
              aria-label={muted ? "Hidupkan muzik" : "Senyapkan muzik"}
              title={muted ? "Hidupkan muzik" : "Senyapkan muzik"}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              type="button"
              className="sim-icon-btn"
              onClick={handleRestart}
              aria-label={copy.restart}
              title={copy.restart}
            >
              <RotateCcw size={18} />
            </button>
          </div>
          <div className="sim-progress-segments" aria-hidden="true">
            {[1, 2, 3, 4].map(n => (
              <i
                key={n}
                className={`seg-${n}${stepIndex > n ? " is-done" : stepIndex === n ? " is-current" : ""}`}
              />
            ))}
          </div>
        </header>

        {state.phase !== "result" ? (
          <div className={`sim-split phase-${state.phase}`}>
            {/* Upper Illustration Stage */}
            <div className="sim-upper">
              <SceneStage
                phase={state.phase}
                decisions={state.decisions}
              />
            </div>

            {/* Lower Clue Banner + Story Box + Decision Controls */}
            <div className={`sim-lower${dictMode ? " is-dict-mode" : ""}`}>
              <div key={state.phase} className="sim-lower-inner">
                {activeDecisionStage ? (
                  <StageClueBanner
                    phase={activeDecisionStage.id}
                    activeWordId={activeWord?.id}
                    onSelectWord={selectWord}
                  />
                ) : (
                  <div className="sim-stage-head">
                    <span className="sim-phase-pill phase-s4-ranking">
                      {rankingStage.badge}
                    </span>
                  </div>
                )}

                <div className="sim-story-card">
                  <p className="sim-narrative">
                    <TranslatableText
                      text={activeDecisionStage ? activeDecisionStage.narrative : rankingStage.narrative}
                      prefixId={`nar-${state.phase}`}
                      activeId={activeWord?.id}
                      onSelectWord={selectWord}
                    />
                  </p>
                  <h2 className="sim-question">
                    <TranslatableText
                      text={activeDecisionStage ? activeDecisionStage.question : rankingStage.question}
                      prefixId={`qst-${state.phase}`}
                      activeId={activeWord?.id}
                      onSelectWord={selectWord}
                    />
                  </h2>
                </div>

                {activeDecisionStage ? (
                  <div className="sim-binary-choices" role="group" aria-label={activeDecisionStage.question}>
                    {activeDecisionStage.choices.map(choice => (
                      <button
                        key={choice.id}
                        type="button"
                        className={`sim-choice-btn choice-${choice.id}`}
                        onClick={() => handleDecide(choice.id)}
                      >
                        <span className="sim-choice-icon" aria-hidden="true">
                          {choice.id === "interview" ? <Check size={42} strokeWidth={3.6} /> : <X size={42} strokeWidth={3.6} />}
                        </span>
                        <strong className="sim-choice-title">
                          {dictMode ? (
                            <TranslatableText
                              text={choice.label}
                              prefixId={`ch-${state.phase}-${choice.id}`}
                              activeId={activeWord?.id}
                              onSelectWord={selectWord}
                            />
                          ) : (
                            choice.label
                          )}
                        </strong>
                      </button>
                    ))}
                  </div>
                ) : (
                  <PriorityRanker
                    order={state.ranking}
                    dictMode={dictMode}
                    activeWordId={activeWord?.id}
                    onChange={handleRankingChange}
                    onSubmit={handleSubmitRanking}
                    onSelectWord={selectWord}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="sim-result-scroll" ref={resultScroller}>
            <DecisionSummaryCard
              decisions={state.decisions}
              ranking={state.ranking}
              activeWordId={activeWord?.id}
              onSelectWord={selectWord}
            />
            <StatisticsResult state={statisticsState} retry={onRetryStatistics} />
          </div>
        )}

        {activeWord && <WordPopover activeWord={activeWord} onClose={() => setActiveWord(null)} />}
      </section>
    </main>
  );
}
