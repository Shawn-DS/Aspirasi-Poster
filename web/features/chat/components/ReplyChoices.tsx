"use client";
import { copy } from "../data/story";
import type { ReplyChoice } from "../types";

export default function ReplyChoices({ choices, disabled, onChoose }: { choices: ReplyChoice[]; disabled: boolean; onChoose: (text: string) => void }) {
  return <div className="reply-choices">
    <div className="suggestions" aria-label={copy.suggestions}>
      {choices.map((choice, index) => <button type="button" key={choice.id} disabled={disabled} onClick={() => onChoose(choice.text)}><span className="choice-number">{index + 1}</span><span>{choice.text}</span></button>)}
    </div>
  </div>;
}
