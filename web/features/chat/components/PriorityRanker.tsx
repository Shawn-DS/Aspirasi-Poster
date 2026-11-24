"use client";
import { useRef, useState } from "react";
import { Check, GripVertical } from "lucide-react";
import type { WordLookupResult } from "../data/dictionary";
import { priorityItemMap, rankingStage } from "../data/story";
import type { PriorityItemId } from "../types";
import TranslatableText from "./TranslatableText";

export default function PriorityRanker({
  order,
  dictMode,
  activeWordId,
  onChange,
  onSubmit,
  onSelectWord,
}: {
  order: [PriorityItemId, PriorityItemId, PriorityItemId];
  dictMode: boolean;
  activeWordId?: string | null;
  onChange: (next: [PriorityItemId, PriorityItemId, PriorityItemId]) => void;
  onSubmit: () => void;
  onSelectWord: (id: string, lookup: WordLookupResult, target: HTMLElement) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const dragRef = useRef<{ index: number; startY: number; moved: boolean } | null>(null);
  const wasMovedRef = useRef(false);

  function swapIndices(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= 3 || to >= 3) return;
    const next = [...order] as [PriorityItemId, PriorityItemId, PriorityItemId];
    const tmp = next[from];
    next[from] = next[to];
    next[to] = tmp;
    onChange(next);
  }

  function handleCardTap(index: number) {
    if (dictMode || wasMovedRef.current) return;
    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      swapIndices(selectedIndex, index);
      setSelectedIndex(null);
    }
  }

  function handleCardPointerDown(index: number, e: React.PointerEvent<HTMLLIElement>) {
    if (dictMode) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    wasMovedRef.current = false;
    setDraggingIndex(index);
    setDragOffsetY(0);
    dragRef.current = { index, startY: e.clientY, moved: false };
  }

  function handleCardPointerMove(e: React.PointerEvent<HTMLLIElement>) {
    const active = dragRef.current;
    if (!active || !listRef.current) return;
    const dy = e.clientY - active.startY;
    if (Math.abs(dy) > 5 && !active.moved) {
      active.moved = true;
      wasMovedRef.current = true;
      setSelectedIndex(null);
    }
    const rows = Array.from(listRef.current.children) as HTMLElement[];
    const rowHeight = rows[active.index]?.getBoundingClientRect().height ?? 56;
    const step = rowHeight + 8;

    if (dy > step * 0.52 && active.index < 2) {
      swapIndices(active.index, active.index + 1);
      active.index += 1;
      active.startY = e.clientY;
      setDraggingIndex(active.index);
      setDragOffsetY(0);
      return;
    }
    if (dy < -step * 0.52 && active.index > 0) {
      swapIndices(active.index, active.index - 1);
      active.index -= 1;
      active.startY = e.clientY;
      setDraggingIndex(active.index);
      setDragOffsetY(0);
      return;
    }
    if (active.moved) {
      setDragOffsetY(Math.max(-step, Math.min(step, dy)));
    }
  }

  function handleCardPointerUp(e: React.PointerEvent<HTMLLIElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const moved = dragRef.current?.moved ?? false;
    dragRef.current = null;
    setDraggingIndex(null);
    setDragOffsetY(0);
    if (moved) {
      window.setTimeout(() => {
        wasMovedRef.current = false;
      }, 60);
    }
  }

  function handleCardKeyDown(index: number, e: React.KeyboardEvent<HTMLLIElement>) {
    if (dictMode) return;
    if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault();
      setSelectedIndex(null);
      swapIndices(index, index - 1);
    } else if (e.key === "ArrowDown" && index < 2) {
      e.preventDefault();
      setSelectedIndex(null);
      swapIndices(index, index + 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardTap(index);
    }
  }

  return (
    <div className="ranker-wrap">
      <ol className="ranker-list" ref={listRef} aria-label="Susun keutamaan 1 hingga 3">
        {order.map((itemId, index) => {
          const item = priorityItemMap[itemId];
          const isDragging = draggingIndex === index;
          const isSelected = selectedIndex === index;
          return (
            <li
              key={itemId}
              tabIndex={0}
              aria-label={`#${index + 1} ${item.label}`}
              className={`ranker-item rank-${index + 1}${isSelected ? " is-selected" : ""}${isDragging ? " is-dragging" : ""}`}
              style={isDragging && dragOffsetY !== 0 ? { transform: `translateY(${dragOffsetY}px) scale(1.015)` } : undefined}
              onPointerDown={e => handleCardPointerDown(index, e)}
              onPointerMove={handleCardPointerMove}
              onPointerUp={handleCardPointerUp}
              onPointerCancel={handleCardPointerUp}
              onClick={() => handleCardTap(index)}
              onKeyDown={e => handleCardKeyDown(index, e)}
            >
              <span className="ranker-num" aria-hidden="true">{index + 1}</span>

              <strong className="ranker-label">
                {dictMode ? (
                  <TranslatableText
                    text={item.label}
                    prefixId={`rank-lbl-${itemId}`}
                    activeId={activeWordId}
                    onSelectWord={onSelectWord}
                  />
                ) : (
                  item.label
                )}
              </strong>

              <span className="ranker-grip" aria-hidden="true">
                <GripVertical size={18} />
              </span>
            </li>
          );
        })}
      </ol>

      <button type="button" className="ranker-submit-btn" onClick={onSubmit}>
        <Check size={17} aria-hidden="true" />
        {rankingStage.submitLabel}
      </button>
    </div>
  );
}
