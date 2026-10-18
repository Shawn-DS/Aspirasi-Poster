"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Camera, Check, CheckCheck, Handshake, Plus, RotateCcw, Send, X } from "lucide-react";
import {
  activityCopy,
  EVIDENCE_RECORD_ID,
  evidenceBilingual,
  resolveBuddyOutcome,
  toolRecords,
  type ActivityId,
} from "../data/activities";
import type { WordLookupResult } from "../data/dictionary";
import { people } from "../data/story";
import type { SenderId } from "../types";
import Avatar from "./Avatar";
import TranslatableText from "./TranslatableText";
import "./chat-activities.css";

type WordProps = {
  activeWordId?: string | null;
  onSelectWord: (id: string, lookup: WordLookupResult, target: HTMLElement) => void;
};

type ActivityProps = WordProps & {
  id: ActivityId;
  onComplete: () => void;
  onUpdate: () => void;
};

function ActivityMessage({ sender, children, own = false }: { sender: SenderId; children: ReactNode; own?: boolean }) {
  return (
    <div className={`activity-message-row${own ? " activity-outgoing" : ""}`}>
      {!own && <Avatar sender={sender} />}
      <div className="activity-message">
        {!own && (
          <strong className="activity-sender" style={{ color: people[sender].color }}>
            {people[sender].name}
          </strong>
        )}
        {children}
        {own && (
          <span className="activity-delivered" aria-hidden="true">
            <CheckCheck size={15} />
          </span>
        )}
      </div>
    </div>
  );
}

export default function ChatActivity({ id, onComplete, onUpdate, activeWordId, onSelectWord }: ActivityProps) {
  const [phase, setPhase] = useState(0);
  const [buddySlots, setBuddySlots] = useState<(SenderId | null)[]>(["you", "amir", "aina", "lim"]);
  const started = useRef(false);
  const callbacks = useRef({ onComplete, onUpdate });
  callbacks.current = { onComplete, onUpdate };
  const copy = activityCopy[id];
  const submitted = phase > 0;
  const buddyOutcome = resolveBuddyOutcome(buddySlots);
  const activeAction = id === "buddy" ? buddyOutcome.action : copy.action;
  const activeReplies = id === "buddy" ? buddyOutcome.replies : copy.replies;

  useEffect(() => {
    callbacks.current.onUpdate();
  }, [phase]);

  useEffect(() => {
    if (!submitted) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = [
      window.setTimeout(() => setPhase(2), reduced ? 180 : 500),
      window.setTimeout(() => setPhase(3), reduced ? 360 : 1100),
      window.setTimeout(() => callbacks.current.onComplete(), reduced ? 500 : 1600),
    ];
    return () => timers.forEach(timer => window.clearTimeout(timer));
    // The timer sequence begins once per submitted activity and survives its reply stages.
  }, [submitted]);

  function submit(arrangedSlots?: (SenderId | null)[]) {
    if (started.current) return;
    if (arrangedSlots) setBuddySlots(arrangedSlots);
    started.current = true;
    setPhase(1);
  }

  function words(text: string, key: string) {
    return (
      <TranslatableText
        text={text}
        prefixId={`activity-${id}-${key}`}
        activeId={activeWordId}
        onSelectWord={onSelectWord}
      />
    );
  }

  return (
    <section className={`chat-activity activity-${id}`} data-activity={id} tabIndex={-1} aria-label={copy.title}>
      <ActivityMessage sender="admin">
        <p className="activity-intro">{words(copy.intro, "intro")}</p>
        {id === "buddy" ? (
          <BuddyCard
            submitted={phase > 0}
            joined={phase >= 3}
            otherPair={buddyOutcome.otherPair}
            onSubmit={slots => submit(slots)}
            words={words}
          />
        ) : (
          <EvidenceCard submitted={phase > 0} onSubmit={() => submit()} words={words} />
        )}
      </ActivityMessage>
      <div className="activity-responses" aria-live="polite" aria-relevant="additions">
        {phase > 0 && (
          <ActivityMessage sender="you" own>
            <p>{words(activeAction, "action")}</p>
          </ActivityMessage>
        )}
        {activeReplies.slice(0, Math.max(0, phase - 1)).map((reply, index) => (
          <ActivityMessage key={index} sender={reply.sender}>
            <p>{words(reply.text, `reply-${index}`)}</p>
          </ActivityMessage>
        ))}
      </div>
    </section>
  );
}

type CardProps = {
  submitted: boolean;
  onSubmit: () => void;
  words: (text: string, key: string) => ReactNode;
};

const ALL_MEMBERS: SenderId[] = ["you", "amir", "aina", "lim"];

function BuddyCard({
  submitted,
  joined,
  otherPair,
  onSubmit,
  words,
}: {
  submitted: boolean;
  joined: boolean;
  otherPair: [SenderId, SenderId];
  onSubmit: (slots: (SenderId | null)[]) => void;
  words: (text: string, key: string) => ReactNode;
}) {
  const copy = activityCopy.buddy;
  // 4 slots: [team1_slot0, team1_slot1, team2_slot0, team2_slot1]
  const [slots, setSlots] = useState<(SenderId | null)[]>([null, null, null, null]);
  const [selectedMember, setSelectedMember] = useState<SenderId | null>(null);
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);
  const [dragState, setDragState] = useState<{
    member: SenderId;
    x: number;
    y: number;
  } | null>(null);

  const slotRefs = useRef<(HTMLButtonElement | null)[]>([null, null, null, null]);
  const podRefs = useRef<(HTMLDivElement | null)[]>([null, null]);
  const gesture = useRef<{
    id: number;
    member: SenderId;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  const unplacedMembers = ALL_MEMBERS.filter(m => !slots.includes(m));
  const allPlaced = slots.every((s): s is SenderId => s !== null);

  function assignMemberToSlot(member: SenderId, targetSlot: number) {
    setSlots(prev => {
      const next = [...prev];
      const existingIndex = next.indexOf(member);
      const occupant = next[targetSlot];

      if (existingIndex !== -1) {
        // Swap between slots
        next[existingIndex] = occupant;
        next[targetSlot] = member;
      } else {
        // Place from tray into targetSlot
        next[targetSlot] = member;
      }

      // Smart auto-complete: if 3 members are placed and only 1 slot & 1 member remain, snap the last one in
      const emptyIndices = next.map((val, idx) => (val === null ? idx : -1)).filter(idx => idx !== -1);
      if (emptyIndices.length === 1) {
        const remainingMember = ALL_MEMBERS.find(m => !next.includes(m));
        if (remainingMember) {
          next[emptyIndices[0]] = remainingMember;
        }
      }

      return next;
    });
    setSelectedMember(null);
  }

  function findDropSlot(clientX: number, clientY: number): number | null {
    // 1. Direct or close hit on one of the 4 slot buttons
    let bestSlot: number | null = null;
    let bestDist = Infinity;

    for (let i = 0; i < 4; i++) {
      const el = slotRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientX >= rect.left - 8 && clientX <= rect.right + 8 && clientY >= rect.top - 8 && clientY <= rect.bottom + 8) {
        return i;
      }
      const cx = (rect.left + rect.right) / 2;
      const cy = (rect.top + rect.bottom) / 2;
      const dist = Math.hypot(clientX - cx, clientY - cy);
      if (dist < bestDist && dist <= 56) {
        bestDist = dist;
        bestSlot = i;
      }
    }
    if (bestSlot !== null) return bestSlot;

    // 2. Hit inside Team Pod 1 or Team Pod 2 container -> pick first empty slot in that pod
    for (let podIdx = 0; podIdx < 2; podIdx++) {
      const pod = podRefs.current[podIdx];
      if (!pod) continue;
      const rect = pod.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        const firstSlot = podIdx * 2;
        const secondSlot = firstSlot + 1;
        if (slots[firstSlot] === null) return firstSlot;
        if (slots[secondSlot] === null) return secondSlot;
        return secondSlot;
      }
    }

    return null;
  }

  function handlePointerDown(member: SenderId, event: ReactPointerEvent<HTMLElement>) {
    if (submitted || !event.isPrimary || event.button !== 0) return;
    gesture.current = {
      id: event.pointerId,
      member,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;
    if (!g.moved && Math.hypot(dx, dy) < 6) return;
    g.moved = true;
    setSelectedMember(g.member);
    setDragState({ member: g.member, x: dx, y: dy });
    setHoverSlot(findDropSlot(event.clientX, event.clientY));
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLElement>, cancelled = false) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    setDragState(null);
    setHoverSlot(null);

    if (g.moved) {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 50);
      if (!cancelled) {
        const target = findDropSlot(event.clientX, event.clientY);
        if (target !== null) {
          assignMemberToSlot(g.member, target);
        }
      }
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleSlotClick(slotIndex: number) {
    if (submitted) return;
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    const occupant = slots[slotIndex];

    if (selectedMember) {
      assignMemberToSlot(selectedMember, slotIndex);
      return;
    }

    if (occupant) {
      // Tap a filled slot to select its member for moving/swapping
      setSelectedMember(occupant);
    } else if (unplacedMembers.length > 0) {
      // Convenience: if user taps an empty slot directly, place the first unplaced member (starting with Anda)
      assignMemberToSlot(unplacedMembers[0], slotIndex);
    }
  }

  function resetBoard() {
    if (submitted) return;
    setSlots([null, null, null, null]);
    setSelectedMember(null);
  }

  function renderSlot(slotIndex: number) {
    const occupant = slots[slotIndex];
    const isHovered = hoverSlot === slotIndex;
    const isSelected = occupant !== null && selectedMember === occupant;
    const isDraggingThis = occupant !== null && dragState?.member === occupant;
    const isReadyTarget = selectedMember !== null && selectedMember !== occupant;

    return (
      <button
        key={slotIndex}
        ref={el => {
          slotRefs.current[slotIndex] = el;
        }}
        type="button"
        disabled={submitted}
        className={`activity-drop-slot${occupant ? " is-filled" : " is-empty"}${isHovered ? " is-drop-target" : ""}${isSelected ? " is-selected" : ""}${isReadyTarget ? " is-ready" : ""}`}
        onPointerDown={occupant ? e => handlePointerDown(occupant, e) : undefined}
        onPointerMove={occupant ? handlePointerMove : undefined}
        onPointerUp={occupant ? e => handlePointerEnd(e) : undefined}
        onPointerCancel={occupant ? e => handlePointerEnd(e, true) : undefined}
        onLostPointerCapture={occupant ? e => handlePointerEnd(e, true) : undefined}
        onContextMenu={e => e.preventDefault()}
        onClick={() => handleSlotClick(slotIndex)}
      >
        {occupant ? (
          <>
            <span
              className="activity-slot-avatar-wrap"
              style={
                isDraggingThis && dragState
                  ? { transform: `translate(${dragState.x}px, ${dragState.y}px)`, zIndex: 10 }
                  : undefined
              }
            >
              <Avatar sender={occupant} />
              {submitted && <Check className="activity-person-check" size={14} aria-hidden="true" />}
            </span>
            <strong>{people[occupant].name}</strong>
          </>
        ) : (
          <>
            <span className="activity-empty-avatar" aria-hidden="true">
              <Plus size={22} />
            </span>
            <span className="activity-empty-label">{copy.emptySlot}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`activity-card activity-buddy-card${submitted ? " is-complete" : ""}`}>
      <div className="activity-card-heading">
        <Handshake size={19} aria-hidden="true" />
        <h3>{words(copy.title, "title")}</h3>
      </div>
      <div className="activity-task-row">
        <p className="activity-task-label">{words(copy.task, "task")}</p>
        {!submitted && slots.some(Boolean) && (
          <button type="button" className="activity-reset-btn" onClick={resetBoard}>
            <RotateCcw size={12} aria-hidden="true" />
            <span>{copy.reset}</span>
          </button>
        )}
      </div>

      {/* Two Team Pods with Drag-and-Drop Slots */}
      <div className="activity-arrangements-board">
        {/* Pasukan 1 */}
        <div
          ref={el => {
            podRefs.current[0] = el;
          }}
          className={`activity-team-pod activity-team-primary${submitted ? " is-confirmed" : ""}`}
        >
          <div className="activity-pod-title">
            <span>{words(copy.teamA, "teamA")}</span>
            {(submitted || (slots[0] && slots[1])) && <Check size={14} className="activity-pod-check" aria-hidden="true" />}
          </div>
          <div className="activity-pod-members">
            {renderSlot(0)}
            <span className="activity-team-link" aria-hidden="true">
              {slots[0] && slots[1] ? <Handshake size={20} /> : "+"}
            </span>
            {renderSlot(1)}
          </div>
        </div>

        {/* Pasukan 2 */}
        <div
          ref={el => {
            podRefs.current[1] = el;
          }}
          className={`activity-team-pod activity-team-secondary${submitted ? " is-confirmed" : ""}`}
        >
          <div className="activity-pod-title">
            <span>{words(copy.teamB, "teamB")}</span>
            {(submitted || (slots[2] && slots[3])) && <Check size={14} className="activity-pod-check" aria-hidden="true" />}
          </div>
          <div className="activity-pod-members">
            {renderSlot(2)}
            <span className="activity-team-link" aria-hidden="true">
              {slots[2] && slots[3] ? <Handshake size={20} /> : "+"}
            </span>
            {renderSlot(3)}
          </div>
        </div>
      </div>

      {!submitted && (
        <>
          {/* Draggable Avatar Tray */}
          {unplacedMembers.length > 0 && (
            <div className="activity-avatar-tray" role="group" aria-label={copy.task}>
              {unplacedMembers.map(member => {
                const isSelected = selectedMember === member;
                const isDraggingThis = dragState?.member === member;
                return (
                  <button
                    key={member}
                    type="button"
                    className={`activity-avatar-source${isSelected ? " is-selected" : ""}`}
                    aria-pressed={isSelected}
                    onPointerDown={e => handlePointerDown(member, e)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={e => handlePointerEnd(e)}
                    onPointerCancel={e => handlePointerEnd(e, true)}
                    onLostPointerCapture={e => handlePointerEnd(e, true)}
                    onContextMenu={e => e.preventDefault()}
                    onClick={() => {
                      if (suppressClick.current) {
                        suppressClick.current = false;
                        return;
                      }
                      setSelectedMember(prev => (prev === member ? null : member));
                    }}
                  >
                    <span
                      className="activity-drag-face"
                      style={
                        isDraggingThis && dragState
                          ? { transform: `translate(${dragState.x}px, ${dragState.y}px)`, zIndex: 10 }
                          : undefined
                      }
                    >
                      <Avatar sender={member} />
                    </span>
                    <span>{people[member].name}</span>
                  </button>
                );
              })}
            </div>
          )}

          <p className="activity-hint" role="status">
            {words(
              allPlaced ? copy.readyHint : selectedMember ? copy.selectedHint : copy.hint,
              "buddy-hint"
            )}
          </p>

          <button
            type="button"
            className="activity-submit-btn"
            disabled={!allPlaced}
            onClick={() => {
              if (!allPlaced) return;
              onSubmit(slots);
            }}
          >
            <Send size={16} aria-hidden="true" />
            <span>{words(copy.confirm, "confirm")}</span>
          </button>
        </>
      )}

      {submitted && (
        <div className="activity-success-group">
          <p className="activity-success" role="status">
            <Check size={16} aria-hidden="true" />
            <span>{words(copy.matched, "matched")}</span>
          </p>
          {joined && (
            <div className="activity-neighbour-team">
              <span className="activity-team-avatars">
                <Avatar sender={otherPair[0]} />
                <Avatar sender={otherPair[1]} />
              </span>
              <p>{words(copy.joined, "joined")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CctvSceneIllustration({
  selection,
}: {
  selection: string | null;
}) {
  return (
    <div className="cctv-frame">
      {/* Top CCTV HUD Overlay */}
      <div className="cctv-hud-top" aria-hidden="true">
        <span className="cctv-rec">
          <i className="cctv-rec-dot" /> REC
        </span>
        <span className="cctv-cam-id">CAM-02 · PONDOK KOMUNITI</span>
        <span className="cctv-timestamp">10:15:22 AM</span>
      </div>

      {/* Taman Harmoni CCTV Community Illustration - 100% clean view */}
      <img
        src="/cctv-pondok.jpg"
        alt={activityCopy.evidence.title}
        className="cctv-svg"
        draggable={false}
      />

      {selection === EVIDENCE_RECORD_ID && (
        <div className="cctv-verified-stamp" aria-hidden="true">
          <Check size={14} />
          <span>BUKTI CCTV SAH · 10:15</span>
        </div>
      )}
    </div>
  );
}

type TransLang = "none" | "zh" | "en";

function EvidenceCard({ submitted, onSubmit, words }: CardProps) {
  const copy = activityCopy.evidence;
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [selection, setSelection] = useState<string | null>(null);
  const [transLang, setTransLang] = useState<TransLang>("none");
  const [activeWord, setActiveWord] = useState<{ id: string; lookup: WordLookupResult } | null>(null);
  const correct = selection === EVIDENCE_RECORD_ID;

  function close() {
    dialog.current?.close();
    setActiveWord(null);
    opener.current?.focus({ preventScroll: true });
  }

  function choose(recordId: string) {
    setSelection(recordId);
    setActiveWord(null);
  }

  function modalWords(text: string, key: string) {
    return (
      <TranslatableText
        text={text}
        prefixId={`activity-evidence-record-${key}`}
        activeId={activeWord?.id}
        onSelectWord={(id, lookup) => setActiveWord({ id, lookup })}
      />
    );
  }

  return (
    <>
      <div className="activity-card activity-evidence-card">
        <div className="activity-card-heading">
          <Camera size={19} aria-hidden="true" />
          <h3>{words(copy.title, "title")}</h3>
        </div>

        {/* Inline CCTV Thumbnail Preview Button */}
        <button
          ref={opener}
          type="button"
          className="activity-cctv-preview"
          aria-haspopup="dialog"
          onClick={() => {
            setActiveWord(null);
            dialog.current?.showModal();
          }}
        >
          <div className="activity-cctv-mini">
            <CctvSceneIllustration selection={submitted ? EVIDENCE_RECORD_ID : selection} />
          </div>
          <div className="activity-cctv-preview-bar">
            <span className="activity-cctv-cta">
              <Camera size={15} aria-hidden="true" />
              <strong>{copy.preview}</strong>
            </span>
            <span className="activity-cctv-sub">{copy.hint}</span>
          </div>
        </button>

        {submitted && (
          <p className="activity-success">
            <Check size={16} aria-hidden="true" />
            <span>{words(copy.shared, "shared")}</span>
          </p>
        )}
      </div>

      {/* Interactive CCTV Evidence Inspection Modal */}
      <dialog
        ref={dialog}
        className="activity-record-dialog activity-photo-dialog"
        aria-labelledby="activity-record-title"
        aria-describedby="activity-record-hint"
        onCancel={event => {
          event.preventDefault();
          close();
        }}
        onClick={event => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              close();
          }
        }}
      >
        <div className="activity-modal-heading">
          <div>
            <span>{copy.label}</span>
            <h2 id="activity-record-title">{copy.title}</h2>
            {transLang === "zh" && (
              <p className="activity-bilingual-title">
                <span className="bilingual-zh">{evidenceBilingual.title.zh}</span>
              </p>
            )}
            {transLang === "en" && (
              <p className="activity-bilingual-title">
                <span className="bilingual-en">{evidenceBilingual.title.en}</span>
              </p>
            )}
          </div>
          <button type="button" className="activity-close-button" aria-label={copy.close} onClick={close} autoFocus>
            <X size={21} />
          </button>
        </div>

        <div className="activity-modal-content">
          <div className="activity-record-toolbar">
            <div className="activity-toolbar-text">
              <p id="activity-record-hint">{modalWords(copy.hint, "hint")}</p>
              {transLang === "zh" && (
                <div className="activity-bilingual-box">
                  <p className="bilingual-zh">{evidenceBilingual.hint.zh}</p>
                </div>
              )}
              {transLang === "en" && (
                <div className="activity-bilingual-box">
                  <p className="bilingual-en">{evidenceBilingual.hint.en}</p>
                </div>
              )}
            </div>
            {/* Separate Language Switcher: BM / 中文 / English */}
            <div className="activity-lang-segmented" role="radiogroup" aria-label="Pilihan Bahasa">
              <button
                type="button"
                role="radio"
                aria-checked={transLang === "none"}
                className={`activity-lang-btn${transLang === "none" ? " is-active" : ""}`}
                onClick={() => {
                  setTransLang("none");
                  setActiveWord(null);
                }}
              >
                BM
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={transLang === "zh"}
                className={`activity-lang-btn${transLang === "zh" ? " is-active" : ""}`}
                onClick={() => {
                  setTransLang(prev => (prev === "zh" ? "none" : "zh"));
                  setActiveWord(null);
                }}
              >
                中文
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={transLang === "en"}
                className={`activity-lang-btn${transLang === "en" ? " is-active" : ""}`}
                onClick={() => {
                  setTransLang(prev => (prev === "en" ? "none" : "en"));
                  setActiveWord(null);
                }}
              >
                EN
              </button>
            </div>
          </div>

          {/* Pure Clean CCTV Illustration without blocking number overlays */}
          <CctvSceneIllustration selection={selection} />

          {/* Feedback Banner right below the CCTV image */}
          {selection && (
            <div className={`activity-record-feedback${correct ? " is-found" : ""}`} role="status">
              <p>{modalWords(correct ? copy.found : copy.wrong, "feedback")}</p>
              {transLang === "zh" && (
                <div className="activity-bilingual-feedback">
                  <p className="bilingual-zh">
                    {correct ? evidenceBilingual.found.zh : evidenceBilingual.wrong.zh}
                  </p>
                </div>
              )}
              {transLang === "en" && (
                <div className="activity-bilingual-feedback">
                  <p className="bilingual-en">
                    {correct ? evidenceBilingual.found.en : evidenceBilingual.wrong.en}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Timestamped Log Entries corresponding to the 4 CCTV Hotspots */}
          <div className="evidence-photo-sheet" role="group" aria-label={copy.choose}>
            {toolRecords.map((record, index) => {
              const isSelected = selection === record.id;
              const isClue = isSelected && correct;
              const trans = evidenceBilingual.records[record.id];
              return (
                <div
                  key={record.id}
                  className={`evidence-photo-row${isSelected ? " is-selected" : ""}${isClue ? " is-clue" : ""}`}
                >
                  <button
                    type="button"
                    className="evidence-photo-tap-area"
                    aria-pressed={isSelected}
                    onClick={() => choose(record.id)}
                  >
                    <span className="evidence-row-index" aria-hidden="true">
                      {isSelected ? <Check size={15} /> : index + 1}
                    </span>
                    <span className="evidence-row-content">
                      <time className="evidence-time-stamp">
                        {record.time} · {trans.spot}
                      </time>
                      <span className="evidence-text">{record.text}</span>
                      {transLang === "zh" && (
                        <span className="evidence-bilingual-lines">
                          <span className="bilingual-zh">{trans.zh}</span>
                        </span>
                      )}
                      {transLang === "en" && (
                        <span className="evidence-bilingual-lines">
                          <span className="bilingual-en">{trans.en}</span>
                        </span>
                      )}
                    </span>
                    {isClue && <span className="evidence-clue-badge">Bukti Sah</span>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {activeWord && (
          <aside className="activity-local-dictionary" role="status">
            <div>
              <strong>{activeWord.lookup.word}</strong>
              <span>{activeWord.lookup.zh}</span>
              <span>{activeWord.lookup.en}</span>
            </div>
            <button
              type="button"
              className="activity-close-button"
              aria-label={copy.closeTranslation}
              onClick={() => setActiveWord(null)}
            >
              <X size={19} />
            </button>
          </aside>
        )}

        <div className="activity-modal-footer">
          <button
            type="button"
            className="activity-share-button"
            disabled={!correct || submitted}
            onClick={() => {
              if (!correct || submitted) return;
              close();
              onSubmit();
            }}
          >
            {submitted ? <Check size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
            <span>
              {submitted
                ? copy.shared
                : transLang === "zh"
                  ? `${copy.share} (${evidenceBilingual.share.zh})`
                  : transLang === "en"
                    ? `${copy.share} (${evidenceBilingual.share.en})`
                    : copy.share}
            </span>
          </button>
        </div>
      </dialog>
    </>
  );
}
