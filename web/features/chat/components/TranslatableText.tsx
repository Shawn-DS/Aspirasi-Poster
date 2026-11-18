"use client";
import { memo, useMemo } from "react";
import { tokenizeText, type WordLookupResult } from "../data/dictionary";

export interface ActiveWordState {
  id: string;
  lookup: WordLookupResult;
  x: number;
  y: number;
  bottom: number;
  placeBelow: boolean;
}

export default memo(function TranslatableText({
  text,
  prefixId,
  activeId,
  onSelectWord,
}: {
  text: string;
  prefixId: string;
  activeId?: string | null;
  onSelectWord: (id: string, lookup: WordLookupResult, target: HTMLElement) => void;
}) {
  const segments = useMemo(() => tokenizeText(text), [text]);
  return <>
    {segments.map((seg, idx) => {
      if (!seg.lookup) return <span key={idx}>{seg.text}</span>;
      const wordId = `${prefixId}-${idx}`;
      const isActive = activeId === wordId;
      const lookup = seg.lookup;
      return (
        <span
          key={idx}
          role="button"
          tabIndex={0}
          className={`translatable-word${isActive ? " is-active" : ""}`}
          onClick={e => {
            e.stopPropagation();
            onSelectWord(wordId, lookup, e.currentTarget);
          }}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onSelectWord(wordId, lookup, e.currentTarget);
            }
          }}
        >
          {seg.text}
        </span>
      );
    })}
  </>;
});
