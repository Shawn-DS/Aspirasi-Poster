import Avatar from "./Avatar";
import { copy, people } from "../data/story";
import type { SenderId } from "../types";
export default function TypingIndicator({ sender }: { sender: SenderId }) {
  return <div className="typing-row" role="status"><Avatar sender={sender} /><div className="typing-bubble"><span className="typing-dots" aria-hidden="true"><i /><i /><i /></span><span>{people[sender].name} {copy.typing}</span></div></div>;
}
