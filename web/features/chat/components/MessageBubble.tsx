import { CheckCheck } from "lucide-react";
import { people } from "../data/story";
import type { ChatMessage } from "../types";
import Avatar from "./Avatar";

export default function MessageBubble({ message, showSender }: { message: ChatMessage; showSender: boolean }) {
  if (message.sender === "system") return <div className="system-message"><span>{message.text}</span></div>;
  const own = message.sender === "you";
  const person = people[message.sender];
  return <article className={`message-row ${own ? "outgoing" : "incoming"} ${showSender ? "new-sender" : "continued"}`} aria-label={person.name}>
    {!own && <div className="message-avatar">{showSender && <Avatar sender={message.sender} />}</div>}
    <div className="message-bubble">{showSender && !own && <strong className="sender-name" style={{ color: person.color }}>{person.name}</strong>}<p>{message.text}</p><span className="message-time"><time>{message.time}</time>{own && <CheckCheck size={15} aria-label="Dihantar dalam simulasi" />}</span></div>
  </article>;
}
