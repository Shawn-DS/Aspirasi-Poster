"use client";
import { useLayoutEffect, useRef } from "react";
import { copy } from "../data/story";
import type { ReplyChoice } from "../types";

export default function ReplyChoices({ choices, disabled, onChoose }: { choices: ReplyChoice[]; disabled: boolean; onChoose: (text: string) => void }) {
  const strip = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (strip.current) strip.current.scrollLeft = 0;
  }, [choices]);
  return <div className="reply-choices">
    <p className="choice-hint">{copy.swipeChoices}</p>
    <div className="suggestions" ref={strip} aria-label={copy.suggestions}>
      {choices.map((choice, index) => <button type="button" key={choice.id} disabled={disabled} onClick={() => onChoose(choice.text)}><span className="choice-number">{index + 1}</span><span>{choice.text}</span></button>)}
    </div>
  </div>;
}
