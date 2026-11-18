"use client";
import { X } from "lucide-react";
import type { ActiveWordState } from "./TranslatableText";

export default function WordPopover({
  activeWord,
  onClose,
}: {
  activeWord: ActiveWordState;
  onClose: () => void;
}) {
  return (
    <div
      className={`word-popover ${activeWord.placeBelow ? "place-below" : "place-above"}`}
      style={{
        left: `${activeWord.x}px`,
        top: `${activeWord.placeBelow ? activeWord.bottom + 8 : activeWord.y - 8}px`,
      }}
      role="status"
      aria-live="polite"
      onClick={e => e.stopPropagation()}
    >
      <div className="word-popover-head">
        <strong>{activeWord.lookup.word}</strong>
        {activeWord.lookup.key !== activeWord.lookup.word.toLowerCase() && (
          <span className="word-popover-stem">({activeWord.lookup.key})</span>
        )}
        <button type="button" className="word-popover-close" aria-label="Tutup terjemahan" onClick={onClose}>
          <X size={13} />
        </button>
      </div>
      <div className="word-popover-row">
        <span className="word-lang-badge zh">中文</span>
        <span>{activeWord.lookup.zh}</span>
      </div>
      <div className="word-popover-row">
        <span className="word-lang-badge en">EN</span>
        <span>{activeWord.lookup.en}</span>
      </div>
    </div>
  );
}
