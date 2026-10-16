"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, Check, Clock3, Info, Leaf, MessageCircle, RotateCcw, Send, ShieldCheck, X } from "lucide-react";
import { communityProfiles, copy, group, people } from "./data/story";
import { MAX_MESSAGE_LENGTH } from "./lib/conversation";
import { useConversation } from "./hooks/useConversation";
import { useChatViewport } from "./hooks/useChatViewport";
import Avatar from "./components/Avatar";
import MessageBubble from "./components/MessageBubble";
import TypingIndicator from "./components/TypingIndicator";
import ReplyChoices from "./components/ReplyChoices";

export default function ChatSimulator() {
  const chat = useConversation();
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const nearBottom = useRef(true);
  const lastCount = useRef(0);
  const canSend = !chat.busy && !chat.complete;
  const length = Array.from(draft).length;
  const { keyboardOpen, height: visibleHeight } = useChatViewport(root, textarea);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const added = Math.max(0, chat.messages.length - lastCount.current);
    lastCount.current = chat.messages.length;
    if (nearBottom.current) { el.scrollTop = el.scrollHeight; setUnread(0); }
    else if (added) setUnread(n => n + added);
  }, [chat.messages, chat.typing, chat.complete, visibleHeight]);

  useLayoutEffect(() => {
    if (!textarea.current) return;
    textarea.current.style.height = "24px";
    textarea.current.style.height = `${Math.min(110, textarea.current.scrollHeight)}px`;
  }, [draft]);

  function send(text = draft) {
    if (!canSend || !text.trim() || Array.from(text.trim()).length > MAX_MESSAGE_LENGTH) return;
    nearBottom.current = true;
    setDraft("");
    chat.send(text);
  }
  function restart() {
    nearBottom.current = true; lastCount.current = 0;
    setDraft(""); setUnread(0); chat.restart();
  }
  function scrollToNew() {
    nearBottom.current = true; setUnread(0);
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "instant" });
  }

  return <main className={`experience ${keyboardOpen ? "keyboard-open" : ""}`} ref={root}>
    <section className="story-panel" aria-labelledby="project-title">
      <a className="project-brand" href="/"><span><MessageCircle size={22} /></span>peluang<span className="brand-light">kedua</span><i /></a>
      <div className="story-heading"><p className="eyebrow"><span />{copy.badge}</p><h1 id="project-title">{copy.title}<br /><em>{copy.titleAccent}</em></h1><p className="story-description">{copy.intro}</p><div className="duration"><Clock3 size={16} />{copy.duration}<span />{copy.privacy}</div></div>
      <div className="story-values"><span><i>01</i>Mendengar</span><span><i>02</i>Menghormati</span><span><i>03</i>Memberi peluang</span></div>
      <div className="project-note"><Leaf size={24} /><p>{group.subject}</p></div><p className="project-footer">{copy.footer}</p>
    </section>

    <section className="chat-frame" aria-label={group.name}>
      <header className="chat-header"><button className="icon-button back-button" aria-label={copy.about} onClick={() => dialog.current?.showModal()}><ArrowLeft size={22} /></button><Avatar group /><button className="group-details" onClick={() => dialog.current?.showModal()}><strong>{group.name}</strong><span>{chat.typing ? `${people[chat.typing].name} ${copy.typing}` : chat.hasAmir ? group.members : group.membersBeforeAmir}</span></button><button className="icon-button" onClick={restart} aria-label={copy.restart} title={copy.restart}><RotateCcw size={19} /></button><button className="icon-button desktop-info" onClick={() => dialog.current?.showModal()} aria-label={copy.about}><Info size={20} /></button></header>
      <div className="chapter-bar"><span className="chapter-dot" /><span>{chat.complete ? copy.promptEnd : chat.step.title}</span><small>{chat.complete ? copy.stepEnd : `${Math.min(chat.turn + 1, chat.totalSteps)} / ${chat.totalSteps}`}</small></div>
      <div className="chat-body" ref={scroller} onScroll={() => { const el = scroller.current!; nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60; if (nearBottom.current) setUnread(0); }}>
        <div className="date-divider"><span>{copy.today}</span></div><div className="simulation-note"><ShieldCheck size={12} />{copy.simulation}</div>
        <div className="message-log" role="log" aria-label="Perbualan komuniti" aria-live="polite" aria-relevant="additions">
          {chat.messages.map((message, i) => <MessageBubble key={message.id} message={message} showSender={i === 0 || chat.messages[i - 1].sender !== message.sender} />)}
        </div>
        {chat.typing && <TypingIndicator sender={chat.typing} />}
        {chat.complete && <section className="reflection-card" aria-labelledby="reflection-title"><span className="reflection-icon"><Leaf size={22} /></span><p className="eyebrow">PELUANG KEDUA</p><h2 id="reflection-title">{chat.ending?.title ?? copy.endTitle}</h2><p>{chat.ending?.text ?? copy.endText}</p><blockquote>{copy.endNote}</blockquote><button onClick={restart}><RotateCcw size={15} />{copy.restart}</button></section>}
      </div>
      {unread > 0 && <button className="new-messages" onClick={scrollToNew}><ArrowDown size={15} />{copy.newMessages}<span>{unread}</span></button>}
      <footer className="chat-composer">
        {!chat.complete && <div className="suggestion-area"><div className="suggestion-toolbar"><p>{chat.busy ? copy.waiting : copy.suggestions}</p>{keyboardOpen && <button type="button" onClick={() => textarea.current?.blur()}>{copy.showSuggestions}<ArrowDown size={12} /></button>}</div><ReplyChoices choices={chat.step.choices} disabled={!canSend} onChoose={send} /></div>}
        {!chat.complete ? <form className="composer-form" onSubmit={e => { e.preventDefault(); send(); }}><div className="composer-field"><textarea ref={textarea} rows={1} value={draft} placeholder={copy.placeholder} aria-label={copy.placeholder} aria-describedby={length > MAX_MESSAGE_LENGTH ? "message-limit" : undefined} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />{length > 400 && <span id="message-limit" className={`character-count ${length > MAX_MESSAGE_LENGTH ? "too-long" : ""}`}>{length}/{MAX_MESSAGE_LENGTH}</span>}</div><button className="send-button" type="submit" onPointerDown={e => { if (document.activeElement === textarea.current) e.preventDefault(); }} disabled={!canSend || !draft.trim() || length > MAX_MESSAGE_LENGTH} aria-label={copy.send}><Send size={20} /></button></form> : <div className="complete-note"><Check size={16} />{copy.endNote}</div>}
        {!chat.complete && <p className="free-text-hint">{copy.freeTextHint}</p>}
      </footer>
    </section>

    <dialog className="about-dialog community-dialog" ref={dialog} aria-labelledby="community-title" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}><div className="dialog-heading"><Avatar group /><button className="icon-button" aria-label={copy.close} onClick={() => dialog.current?.close()}><X size={21} /></button></div><p className="eyebrow">PERSATUAN PENDUDUK</p><h2 id="community-title">{copy.about}</h2><p className="community-subtitle">{copy.aboutSubtitle}</p><div className="community-announcement"><span>{copy.announcementLabel}</span><p>{copy.announcement}</p></div><p>{copy.aboutText}</p><p className="eyebrow profile-label">{copy.peopleLabel}</p><ul className="community-people">{communityProfiles.map(profile => <li key={profile.sender}><Avatar sender={profile.sender} /><div><strong style={{ color: people[profile.sender].color }}>{people[profile.sender].name}</strong><span>{profile.role}</span><p>{profile.description}</p></div></li>)}</ul><div className="community-question"><Leaf size={21} /><p>{copy.communityQuestion}</p></div><p className="community-simulation">{copy.simulationNote}</p><button className="dialog-close" onClick={() => dialog.current?.close()}>{copy.backToChat}</button></dialog>
  </main>;
}
