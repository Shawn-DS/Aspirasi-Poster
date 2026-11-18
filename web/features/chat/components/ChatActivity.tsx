"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Check, CheckCheck, Handshake, Plus, RotateCcw, Send } from "lucide-react";
import {
  activityCopy,
  resolveBuddyOutcome,
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
  const activeAction = buddyOutcome.action;
  const activeReplies = buddyOutcome.replies;

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
        <BuddyCard
          submitted={phase > 0}
          joined={phase >= 3}
          otherPair={buddyOutcome.otherPair}
          onSubmit={slots => submit(slots)}
          words={words}
        />
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

const ALL_MEMBERS: SenderId[] = ["you", "amir", "aina", "lim"];
const TEAM_PODS = [
  { index: 0, variant: "primary", labelKey: "teamA" as const, slotIndices: [0, 1] as const },
  { index: 1, variant: "secondary", labelKey: "teamB" as const, slotIndices: [2, 3] as const },
] as const;

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
        {TEAM_PODS.map(pod => {
          const [firstSlot, secondSlot] = pod.slotIndices;
          const bothFilled = Boolean(slots[firstSlot] && slots[secondSlot]);
          return (
            <div
              key={pod.labelKey}
              ref={el => {
                podRefs.current[pod.index] = el;
              }}
              className={`activity-team-pod activity-team-${pod.variant}${submitted ? " is-confirmed" : ""}`}
            >
              <div className="activity-pod-title">
                <span>{words(copy[pod.labelKey], pod.labelKey)}</span>
                {(submitted || bothFilled) && <Check size={14} className="activity-pod-check" aria-hidden="true" />}
              </div>
              <div className="activity-pod-members">
                {renderSlot(firstSlot)}
                <span className="activity-team-link" aria-hidden="true">
                  {bothFilled ? <Handshake size={20} /> : "+"}
                </span>
                {renderSlot(secondSlot)}
              </div>
            </div>
          );
        })}
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
            <span>{copy.confirm}</span>
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
