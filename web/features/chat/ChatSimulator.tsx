"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, Check, Clock3, Info, Leaf, MessageCircle, RotateCcw, Scale, ShieldCheck, X } from "lucide-react";
import { communityProfiles, copy, ethicsLensMeta, group, people } from "./data/story";
import { useConversation } from "./hooks/useConversation";
import { useChatViewport } from "./hooks/useChatViewport";
import Avatar from "./components/Avatar";
import MessageBubble from "./components/MessageBubble";
import TypingIndicator from "./components/TypingIndicator";
import ReplyChoices from "./components/ReplyChoices";
import type { EthicsLens } from "./types";

const LENS_ORDER: EthicsLens[] = ["deontology", "utilitarianism", "care"];

export default function ChatSimulator() {
  const chat = useConversation();
  const [unread, setUnread] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const nearBottom = useRef(true);
  const lastCount = useRef(0);
  const canSend = !chat.busy && !chat.complete;
  const { height: visibleHeight } = useChatViewport(root);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const added = Math.max(0, chat.messages.length - lastCount.current);
    lastCount.current = chat.messages.length;
    if (nearBottom.current) { el.scrollTop = el.scrollHeight; setUnread(0); }
    else if (added) setUnread(n => n + added);
  }, [chat.messages, chat.typing, chat.complete, visibleHeight]);

  function choose(text: string) {
    if (!canSend) return;
    nearBottom.current = true;
    chat.send(text);
  }
  function restart() {
    nearBottom.current = true; lastCount.current = 0;
    setUnread(0); chat.restart();
  }
  function scrollToNew() {
    nearBottom.current = true; setUnread(0);
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "instant" });
  }

  return <main className="experience" ref={root}>
    <section className="story-panel" aria-labelledby="project-title">
      <a className="project-brand" href="/"><span><MessageCircle size={22} /></span>peluang<span className="brand-light">kedua</span><i /></a>
      <div className="story-heading"><p className="eyebrow"><span />{copy.badge}</p><h1 id="project-title">{copy.title}<br /><em>{copy.titleAccent}</em></h1><p className="story-description">{copy.intro}</p><div className="duration"><Clock3 size={16} />{copy.duration}<span />{copy.privacy}</div></div>
      <div className="story-values"><span><i>01</i>Deontologi</span><span><i>02</i>Utilitarianisme</span><span><i>03</i>Ethics of Care</span></div>
      <div className="project-note"><Leaf size={24} /><p>{group.subject}</p></div><p className="project-footer">{copy.footer}</p>
    </section>

    <section className="chat-frame" aria-label={group.name}>
      <header className="chat-header"><button className="icon-button back-button" aria-label={copy.about} onClick={() => dialog.current?.showModal()}><ArrowLeft size={22} /></button><Avatar group /><button className="group-details" onClick={() => dialog.current?.showModal()}><strong>{group.name}</strong><span>{chat.typing ? `${people[chat.typing].name} ${copy.typing}` : chat.hasAmir ? group.members : group.membersBeforeAmir}</span></button><button className="icon-button" onClick={restart} aria-label={copy.restart} title={copy.restart}><RotateCcw size={19} /></button><button className="icon-button desktop-info" onClick={() => dialog.current?.showModal()} aria-label={copy.about}><Info size={20} /></button></header>
      <div className="chapter-bar">
        <span className="chapter-dot" />
        <span className="chapter-title">{chat.complete ? copy.promptEnd : chat.step.title}</span>
        <small>{chat.complete ? copy.stepEnd : `${Math.min(chat.turn + 1, chat.totalSteps)} / ${chat.totalSteps}`}</small>
      </div>
      <div className="chat-body" ref={scroller} onScroll={() => { const el = scroller.current!; nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60; if (nearBottom.current) setUnread(0); }}>
        <div className="date-divider"><span>{copy.today}</span></div><div className="simulation-note"><ShieldCheck size={12} />{copy.simulation}</div>
        <div className="message-log" role="log" aria-label="Perbualan komuniti" aria-live="polite" aria-relevant="additions">
          {chat.messages.map((message, i) => <MessageBubble key={message.id} message={message} showSender={i === 0 || chat.messages[i - 1].sender !== message.sender} />)}
        </div>
        {chat.typing && <TypingIndicator sender={chat.typing} />}
        {chat.complete && <section className={`reflection-card profile-${chat.ethicsProfile.id}`} aria-labelledby="reflection-title">
          <span className="reflection-icon"><Scale size={21} /></span>
          <p className="eyebrow">REFLEKSI DILEMA ETIKA</p>
          <h2 id="reflection-title">{chat.ethicsProfile.title}</h2>
          <div className="reflection-ethics">
            <p className="reflection-ethics-head">{copy.ethicsResultLabel}</p>
            <p className="reflection-ethics-badge">{chat.ethicsProfile.badge}</p>
            <ul className="ethics-breakdown" aria-label={copy.ethicsResultLabel}>
              {LENS_ORDER.map(lens => {
                const count = chat.counts[lens];
                const pct = Math.round((count / chat.totalSteps) * 100);
                return <li key={lens} className={`lens-${lens}`}>
                  <div className="ethics-row-head">
                    <strong>{ethicsLensMeta[lens].name} <span>({ethicsLensMeta[lens].subtitle})</span></strong>
                    <b>{count} / {chat.totalSteps}</b>
                  </div>
                  <div className="ethics-row-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
                </li>;
              })}
            </ul>
            <p className="reflection-ethics-summary">{chat.ethicsProfile.summary}</p>
          </div>
          <p>{chat.ending?.text ?? copy.endText}</p>
          <blockquote>{copy.endNote}</blockquote>
          <button onClick={restart}><RotateCcw size={15} />{copy.restart}</button>
        </section>}
      </div>
      {unread > 0 && <button className="new-messages" onClick={scrollToNew}><ArrowDown size={15} />{copy.newMessages}<span>{unread}</span></button>}
      <footer className="chat-composer">
        {!chat.complete ? <div className="suggestion-area">
          <div className="suggestion-toolbar"><p>{chat.busy ? copy.waiting : copy.suggestions}</p></div>
          <ReplyChoices choices={chat.step.choices} disabled={!canSend} onChoose={choose} />
        </div> : <div className="complete-note"><Check size={16} />{copy.endNote}</div>}
      </footer>
    </section>

    <dialog className="about-dialog community-dialog" ref={dialog} aria-labelledby="community-title" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}><div className="dialog-heading"><Avatar group /><button className="icon-button" aria-label={copy.close} onClick={() => dialog.current?.close()}><X size={21} /></button></div><p className="eyebrow">PERSATUAN PENDUDUK</p><h2 id="community-title">{copy.about}</h2><p className="community-subtitle">{copy.aboutSubtitle}</p><div className="community-announcement"><span>{copy.announcementLabel}</span><p>{copy.announcement}</p></div><p>{copy.aboutText}</p><p className="eyebrow profile-label">{copy.peopleLabel}</p><ul className="community-people">{communityProfiles.map(profile => <li key={profile.sender}><Avatar sender={profile.sender} /><div><strong style={{ color: people[profile.sender].color }}>{people[profile.sender].name}</strong><span>{profile.role}</span><p>{profile.description}</p></div></li>)}</ul><div className="community-question"><Leaf size={21} /><p>{copy.communityQuestion}</p></div><p className="community-simulation">{copy.simulationNote}</p><button className="dialog-close" onClick={() => dialog.current?.close()}>{copy.backToChat}</button></dialog>
  </main>;
}
