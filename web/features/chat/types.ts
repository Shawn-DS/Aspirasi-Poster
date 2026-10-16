export type SenderId = "aina" | "lim" | "admin" | "amir" | "you" | "system";
export type MessageDraft = { sender: SenderId; text: string };
export type ChatMessage = MessageDraft & { id: number; time: string };
export type Reflection = { title: string; text: string };
export type ReplyChoice = { id: string; text: string; replies: MessageDraft[]; ending?: Reflection };
export type StoryStep = {
  id: string;
  title: string;
  prompt: MessageDraft;
  choices: ReplyChoice[];
  fallback: MessageDraft[];
  transition?: MessageDraft[];
};
export type ConversationState = {
  messages: ChatMessage[];
  queue: MessageDraft[];
  turn: number;
  nextId: number;
  firstChoice: string | null;
  ending: Reflection | null;
};
export type ConversationAction =
  | { type: "advance"; time: string }
  | { type: "send"; text: string; time: string }
  | { type: "restart" };
