import { CheckCheck, UserPlus } from "lucide-react";
import type { WordLookupResult } from "../data/dictionary";
import { people } from "../data/story";
import type { ChatMessage } from "../types";
import Avatar from "./Avatar";
import TranslatableText from "./TranslatableText";

export default function MessageBubble({
  message,
  showSender,
  activeWordId,
  onSelectWord,
}: {
  message: ChatMessage;
  showSender: boolean;
  activeWordId?: string | null;
  onSelectWord: (id: string, lookup: WordLookupResult, target: HTMLElement) => void;
}) {
  if (message.sender === "system") {
    const isAmirArrival = message.text.includes("menambah Amir");
    return (
      <div className={`system-message${isAmirArrival ? " amir-arrival" : ""}`}>
        <span>
          {isAmirArrival && (
            <i className="amir-arrival-badge" aria-hidden="true">
              <Avatar sender="amir" />
              <UserPlus size={12} />
            </i>
          )}
          <span>
            <TranslatableText text={message.text} prefixId={`sys-${message.id}`} activeId={activeWordId} onSelectWord={onSelectWord} />
          </span>
        </span>
      </div>
    );
  }
  const own = message.sender === "you";
  const person = people[message.sender];
  return <article className={`message-row ${own ? "outgoing" : "incoming"} ${showSender ? "new-sender" : "continued"}`} aria-label={person.name}>
    {!own && <div className="message-avatar">{showSender && <Avatar sender={message.sender} />}</div>}
    <div className="message-bubble">{showSender && !own && <strong className="sender-name" style={{ color: person.color }}>{person.name}</strong>}<p><TranslatableText text={message.text} prefixId={`msg-${message.id}`} activeId={activeWordId} onSelectWord={onSelectWord} /></p><span className="message-time"><time>{message.time}</time>{own && <CheckCheck size={15} aria-label="Dihantar dalam simulasi" />}</span></div>
  </article>;
}
