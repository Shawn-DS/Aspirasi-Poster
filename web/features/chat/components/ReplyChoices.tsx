"use client";
import type { WordLookupResult } from "../data/dictionary";
import { copy } from "../data/story";
import type { ReplyChoice } from "../types";
import TranslatableText from "./TranslatableText";

export default function ReplyChoices({
  choices,
  disabled,
  dictMode = false,
  activeWordId,
  onChoose,
  onSelectWord,
}: {
  choices: ReplyChoice[];
  disabled: boolean;
  dictMode?: boolean;
  activeWordId?: string | null;
  onChoose: (text: string) => void;
  onSelectWord?: (id: string, lookup: WordLookupResult, target: HTMLElement) => void;
}) {
  return <div className={`reply-choices${dictMode ? " dict-mode" : ""}`}>
    <div className="suggestions" aria-label={copy.suggestions}>
      {choices.map((choice, index) => (
        <button
          type="button"
          key={choice.id}
          disabled={disabled}
          onClick={() => {
            if (!dictMode) onChoose(choice.text);
          }}
        >
          <span
            className="choice-number"
            onClick={e => {
              if (dictMode && !disabled) {
                e.stopPropagation();
                onChoose(choice.text);
              }
            }}
          >
            {index + 1}
          </span>
          <span>
            {dictMode && onSelectWord ? (
              <TranslatableText
                text={choice.text}
                prefixId={`choice-${choice.id}`}
                activeId={activeWordId}
                onSelectWord={onSelectWord}
              />
            ) : (
              choice.text
            )}
          </span>
        </button>
      ))}
    </div>
  </div>;
}
