"use client";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, BookOpen, Check, Clock3, Info, Leaf, MessageCircle, RotateCcw, ShieldCheck, Smile, Volume2, VolumeX } from "lucide-react";
import type { WordLookupResult } from "./data/dictionary";
import { activityCopy } from "./data/activities";
import { activityAnchors } from "./lib/activities";
import { copy, group, people, steps } from "./data/story";
import { LENS_VIBRATION } from "./lib/conversation";
import { sound } from "./lib/sound";
import { useConversation } from "./hooks/useConversation";
import { useChatViewport } from "./hooks/useChatViewport";
import { useSocialInteractions } from "./hooks/useSocialInteractions";
import Avatar from "./components/Avatar";
import EthicsSticker from "./components/EthicsSticker";
import MessageBubble, { ChatStickerBubble } from "./components/MessageBubble";
import TypingIndicator from "./components/TypingIndicator";
import ReplyChoices from "./components/ReplyChoices";
import ChatActivity from "./components/ChatActivity";
import ReflectionCard, { MAX_MASCOT_QUOTES } from "./components/ReflectionCard";
import WordPopover from "./components/WordPopover";
import StickerDrawer from "./components/StickerDrawer";
import CommunityDialog from "./components/CommunityDialog";
import TranslatableText, { type ActiveWordState } from "./components/TranslatableText";
import type { EthicsLens, EthicsProfileId } from "./types";
import StatisticsResult from "../statistics/StatisticsResult";
import type { StatisticsSyncState } from "../statistics/client";

const CHAPTER_MASCOT_LABELS: Record<EthicsProfileId | "seed", string> = {
  seed: "🌱 Tunas Etika",
  deontology: "⚖️ Deontologi",
  utilitarianism: "🌟 Utilitarianisme",
  care: "💖 Ethics of Care",
  balanced: "🌿 Seimbang",
};

export default function ChatSimulator({ onAnswer, onComplete, statisticsState, onRetryStatistics }: {
  onAnswer: (questionId: string, choiceId: string) => void;
  onComplete: () => void;
  statisticsState: StatisticsSyncState;
  onRetryStatistics: () => void;
}) {
  const chat = useConversation();
  const social = useSocialInteractions(chat.messages);
  const [unread, setUnread] = useState(0);
  const [muted, setMuted] = useState(() => sound.isMuted());
  const [effect, setEffect] = useState<{ lens: EthicsLens; key: number } | null>(null);
  const [activeWord, setActiveWord] = useState<ActiveWordState | null>(null);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<number | null>(null);
  const [dictMode, setDictMode] = useState(false);
  const [stickerDrawerOpen, setStickerDrawerOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(260);
  const [chapterTip, setChapterTip] = useState(false);
  const [mascotPokes, setMascotPokes] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLElement>(null);
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const nearBottom = useRef(true);
  const lastCount = useRef(0);
  const lastSocialCount = useRef(0);
  const canSend = !chat.busy && !chat.complete;
  const attachments = activityAnchors(chat.messages);
  const displayTurn = chat.activity ? chat.turn - 1 : chat.turn;
  const { height: visibleHeight } = useChatViewport(root);

  const answeredCount = chat.counts.deontology + chat.counts.utilitarianism + chat.counts.care;
  const miniMascotState: EthicsProfileId | "seed" = answeredCount === 0 ? "seed" : chat.ethicsProfile.id;

  useEffect(() => {
    // Observe accepted reducer messages; rapid duplicate taps never emit a
    // second answer. Decorative reactions and team arrangements are excluded.
    chat.messages.filter(message => message.sender === "you").forEach((message, index) => {
      const step = steps[index];
      const choice = step?.choices.find(option => option.text === message.text);
      if (choice) onAnswer(step.id, choice.id);
    });
    if (chat.complete) onComplete();
  }, [chat.messages, chat.complete, onAnswer, onComplete]);

  useEffect(() => {
    sound.startBgm(chat.complete ? "complete" : "thinking");
  }, [chat.complete]);

  useEffect(() => {
    return () => sound.stopBgm();
  }, []);

  useEffect(() => {
    if (!effect) return;
    const timer = window.setTimeout(() => setEffect(null), 1120);
    return () => window.clearTimeout(timer);
  }, [effect]);

  useEffect(() => {
    if (!chapterTip) return;
    const timer = window.setTimeout(() => setChapterTip(false), 1800);
    return () => window.clearTimeout(timer);
  }, [chapterTip]);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const socialAdded = Math.max(0, social.count - lastSocialCount.current);
    const storyAdded = Math.max(0, chat.messages.length - lastCount.current);
    const added = storyAdded + socialAdded;
    const newest = chat.messages.at(-1);
    if ((storyAdded && newest && newest.sender !== "you" && newest.sender !== "system") || (socialAdded && social.lastIsReply)) {
      sound.playMessagePop();
    }
    lastCount.current = chat.messages.length;
    lastSocialCount.current = social.count;
    if (nearBottom.current) { el.scrollTop = el.scrollHeight; setUnread(0); }
    else if (added) setUnread(n => n + added);
  }, [chat.messages, chat.typing, chat.complete, visibleHeight, social.count, social.lastIsReply]);

  useLayoutEffect(() => {
    const body = scroller.current;
    if (!stickerDrawerOpen || !body) return;
    const measure = () => setDrawerHeight(Math.max(80, body.clientHeight - 12));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    return () => observer.disconnect();
  }, [stickerDrawerOpen]);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    sound.setMuted(next);
    if (!next) sound.startBgm(chat.complete ? "complete" : "thinking");
  }

  const openReaction = useCallback((id: number) => {
    setActiveWord(null);
    setStickerDrawerOpen(false);
    setActiveReactionMsgId(id);
  }, []);
  const closeReaction = useCallback(() => setActiveReactionMsgId(null), []);

  const activityUpdated = useCallback(() => {
    sound.playMessagePop();
    const el = scroller.current;
    if (el && nearBottom.current) el.scrollTop = el.scrollHeight;
    else setUnread(count => count + 1);
  }, []);

  const selectWord = useCallback((id: string, lookup: WordLookupResult, target: HTMLElement) => {
    setActiveReactionMsgId(null);
    setStickerDrawerOpen(false);
    const frameEl = frame.current;
    if (!frameEl) return;
    const frameRect = frameEl.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const rawX = targetRect.left - frameRect.left + targetRect.width / 2;
    const minX = 128;
    const maxX = Math.max(minX, frameRect.width - 128);
    const x = Math.min(maxX, Math.max(minX, rawX));
    const y = targetRect.top - frameRect.top;
    const bottom = targetRect.bottom - frameRect.top;
    const placeBelow = y < 150;
    setActiveWord(previous => previous?.id === id ? null : { id, lookup, x, y, bottom, placeBelow });
  }, []);

  function choose(text: string) {
    if (!canSend) return;
    setActiveWord(null);
    setActiveReactionMsgId(null);
    setStickerDrawerOpen(false);
    setDictMode(false);
    sound.startBgm("thinking");
    const matched = chat.step.choices.find(option => option.text === text);
    if (matched) {
      setEffect({ lens: matched.lens, key: chat.turn + 1 });
      sound.playChoiceSfx(matched.lens);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate(LENS_VIBRATION[matched.lens]); } catch {}
      }
    }
    nearBottom.current = true;
    chat.send(text);
  }

  function handleSendSticker(stickerId: string) {
    sound.playMascotBoing();
    nearBottom.current = true;
    setStickerDrawerOpen(false);
    social.sendSticker(stickerId);
  }

  function restart() {
    nearBottom.current = true; lastCount.current = 0; lastSocialCount.current = 0;
    setUnread(0); setEffect(null); setActiveWord(null); setActiveReactionMsgId(null);
    setDictMode(false); setStickerDrawerOpen(false); social.reset();
    setChapterTip(false); setMascotPokes(0);
    sound.startBgm("thinking");
    chat.restart();
  }
  function scrollToNew() {
    nearBottom.current = true; setUnread(0);
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "instant" });
  }

  function handleMiniMascotClick(e: React.MouseEvent) {
    e.stopPropagation();
    sound.playMascotBoing();
    setChapterTip(true);
  }

  function handleReflectionMascotClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (mascotPokes >= MAX_MASCOT_QUOTES) return;
    sound.playMascotBoing();
    setMascotPokes(n => Math.min(MAX_MASCOT_QUOTES, n + 1));
  }

  return <main className="experience" ref={root}>
    <section className="story-panel" aria-labelledby="project-title">
      <a className="project-brand" href="/"><span><MessageCircle size={22} /></span>peluang<span className="brand-light">kedua</span><i /></a>
      <div className="story-heading"><p className="eyebrow"><span />{copy.badge}</p><h1 id="project-title">{copy.title}<br /><em>{copy.titleAccent}</em></h1><p className="story-description">{copy.intro}</p><div className="duration"><Clock3 size={16} />{copy.duration}<span />{copy.privacy}</div></div>
      <div className="story-values"><span><i>01</i>Deontologi</span><span><i>02</i>Utilitarianisme</span><span><i>03</i>Ethics of Care</span></div>
      <div className="project-note"><Leaf size={24} /><p>{group.subject}</p></div><p className="project-footer">{copy.footer}</p>
    </section>

    <section
      className={`chat-frame ${effect ? `frame-effect-${effect.lens}` : ""}`}
      ref={frame}
      aria-label={group.name}
      onClick={() => {
        if (activeWord) setActiveWord(null);
        if (activeReactionMsgId) setActiveReactionMsgId(null);
      }}
    >
      <header className="chat-header"><button className="icon-button back-button" aria-label={copy.about} onClick={() => dialog.current?.showModal()}><ArrowLeft size={22} /></button><Avatar group /><button className="group-details" onClick={() => dialog.current?.showModal()}><strong>{group.name}</strong><span>{chat.typing ? `${people[chat.typing].name} ${copy.typing}` : chat.hasAmir ? group.members : group.membersBeforeAmir}</span></button><button className="icon-button" onClick={toggleMute} aria-label={muted ? "Hidupkan muzik" : "Senyapkan muzik"} title={muted ? "Hidupkan muzik" : "Senyapkan muzik"}>{muted ? <VolumeX size={19} /> : <Volume2 size={19} />}</button><button className="icon-button" onClick={restart} aria-label={copy.restart} title={copy.restart}><RotateCcw size={19} /></button><button className="icon-button desktop-info" onClick={() => dialog.current?.showModal()} aria-label={copy.about}><Info size={20} /></button></header>
      <div className="chapter-bar">
        <span className="chapter-dot" />
        <span className="chapter-title">{chat.complete ? copy.promptEnd : chat.step.title}</span>
        <div className="chapter-meta">
          {chapterTip && (
            <span className="chapter-mascot-toast" role="status">
              {CHAPTER_MASCOT_LABELS[miniMascotState]}
            </span>
          )}
          <button
            key={`${miniMascotState}-${answeredCount}`}
            type="button"
            className={`chapter-mascot-pill state-${miniMascotState}${chapterTip ? " is-active" : ""}`}
            onClick={handleMiniMascotClick}
            aria-label={`Kompas etika semasa: ${CHAPTER_MASCOT_LABELS[miniMascotState]}`}
            title={CHAPTER_MASCOT_LABELS[miniMascotState]}
          >
            {miniMascotState === "seed" ? (
              <span className="chapter-seed-icon" aria-hidden="true">🌱</span>
            ) : (
              <EthicsSticker type={miniMascotState} size={22} />
            )}
          </button>
          <small>{chat.complete ? copy.stepEnd : `${Math.min(displayTurn + 1, chat.totalSteps)} / ${chat.totalSteps}`}</small>
        </div>
        <div className="chapter-progress" aria-hidden="true">
          <i style={{ width: `${chat.complete ? 100 : Math.round(((displayTurn + 1) / chat.totalSteps) * 100)}%` }} />
        </div>
      </div>
      <div
        className="chat-body"
        ref={scroller}
        onWheel={() => { setActiveWord(null); setActiveReactionMsgId(null); }}
        onTouchMove={e => {
          if ((e.target as HTMLElement).closest(".whatsapp-reaction-popover")) return;
          setActiveWord(null); setActiveReactionMsgId(null);
        }}
        onKeyDown={e => {
          if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) {
            setActiveWord(null); setActiveReactionMsgId(null);
          }
        }}
        onScroll={() => {
          const el = scroller.current!;
          nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
          if (nearBottom.current) setUnread(0);
        }}
      >
        <div className="date-divider"><span>{copy.today}</span></div><div className="simulation-note"><ShieldCheck size={12} />{copy.simulation}</div>
        <div className="dictionary-hint"><BookOpen size={12} />Ketik perkataan untuk terjemah · Tekan lama mesej untuk reaksi</div>
        <div className="message-log" role="log" aria-label="Perbualan komuniti" aria-live="polite" aria-relevant="additions">
          {chat.messages.map((message, i) => {
            const interactions = social.byAnchor.get(message.id) ?? [];
            return (
              <Fragment key={message.id}>
                <MessageBubble
                  message={message}
                  showSender={i === 0 || chat.messages[i - 1].sender !== message.sender}
                  activeWordId={activeWord?.id.startsWith(`msg-${message.id}-`) || activeWord?.id.startsWith(`sys-${message.id}-`) ? activeWord.id : null}
                  reactionOpen={activeReactionMsgId === message.id}
                  onOpenReaction={openReaction}
                  onCloseReaction={closeReaction}
                  onReact={social.react}
                  onSelectWord={selectWord}
                />
                {attachments.buddy === message.id && <ChatActivity id="buddy" onComplete={() => chat.finishActivity("buddy")} onUpdate={activityUpdated} activeWordId={activeWord?.id} onSelectWord={selectWord} />}
                {interactions.map(entry => entry.stickerId ? (
                  <ChatStickerBubble key={`social-${entry.id}`} stickerId={entry.stickerId} time={entry.time} own autoReactEmoji={entry.autoReactEmoji} />
                ) : entry.reply && (
                  <article key={`social-${entry.id}`} className="message-row incoming new-sender social-reply" aria-label={people[entry.reply.sender].name}>
                    <div className="message-avatar"><Avatar sender={entry.reply.sender} /></div>
                    <div className="message-bubble">
                      <strong className="sender-name" style={{ color: people[entry.reply.sender].color }}>{people[entry.reply.sender].name}</strong>
                      {entry.quote ? <blockquote className="social-quote">
                        <small><TranslatableText text="Reaksi anda" prefixId={`social-${entry.id}-label`} activeId={activeWord?.id} onSelectWord={selectWord} /> {entry.reaction} · {people[entry.quote.sender].name}</small>
                        <span><TranslatableText text={entry.quote.text} prefixId={`social-${entry.id}-quote`} activeId={activeWord?.id} onSelectWord={selectWord} /></span>
                      </blockquote> : <small className="social-emoji-label"><TranslatableText text="Membalas emoji anda" prefixId={`social-${entry.id}-label`} activeId={activeWord?.id} onSelectWord={selectWord} /> {entry.reaction}</small>}
                      <p><TranslatableText text={entry.reply.text} prefixId={`social-${entry.id}-reply`} activeId={activeWord?.id} onSelectWord={selectWord} /></p>
                      <span className="message-time"><time>{entry.time}</time></span>
                    </div>
                  </article>
                ))}
              </Fragment>
            );
          })}
        </div>
        {chat.typing && <TypingIndicator sender={chat.typing} />}
        {chat.complete && (
          <ReflectionCard
            ethicsProfile={chat.ethicsProfile}
            counts={chat.counts}
            totalSteps={chat.totalSteps}
            mascotPokes={mascotPokes}
            activeWordId={activeWord?.id}
            onPokeMascot={handleReflectionMascotClick}
            onSelectWord={selectWord}
            onRestart={restart}
          />
        )}
        {chat.complete && <StatisticsResult state={statisticsState} retry={onRetryStatistics} />}
      </div>
      {activeWord && <WordPopover activeWord={activeWord} onClose={() => setActiveWord(null)} />}
      {effect && <div key={effect.key} className={`choice-effect lens-${effect.lens}`} aria-hidden="true">
        <div className={`sticker-burst-stage burst-${effect.lens}`}>
          <span className="burst-halo" />
          <span className="burst-particle p1" />
          <span className="burst-particle p2" />
          <span className="burst-particle p3" />
          <span className="burst-particle p4" />
          <span className="burst-particle p5" />
          <span className="burst-particle p6" />
          <div className="burst-sticker-pop">
            <EthicsSticker type={effect.lens} size={118} />
            <span className="burst-sticker-tag">
              {effect.lens === "deontology" ? "⚖️ DEONTOLOGI" : effect.lens === "utilitarianism" ? "🌟 UTILITARIANISME" : "💖 ETHICS OF CARE"}
            </span>
          </div>
        </div>
      </div>}
      {unread > 0 && <button className="new-messages" onClick={scrollToNew}><ArrowDown size={15} />{copy.newMessages}<span>{unread}</span></button>}
      <footer className="chat-composer" onClick={e => e.stopPropagation()}>
        {stickerDrawerOpen && (
          <StickerDrawer
            maxHeight={drawerHeight}
            onSelectSticker={handleSendSticker}
            onClose={() => setStickerDrawerOpen(false)}
          />
        )}
        {chat.activity ? <div className="activity-composer">
          <span>{activityCopy.waiting}</span>
          <button type="button" onClick={() => {
            setActiveWord(null); setActiveReactionMsgId(null); setStickerDrawerOpen(false);
            const card = scroller.current?.querySelector<HTMLElement>(`[data-activity="${chat.activity}"]`);
            card?.scrollIntoView({ block: "start", behavior: "instant" });
            card?.focus({ preventScroll: true });
          }}>{activityCopy.continue}</button>
        </div> : !chat.complete ? <div className="suggestion-area">
          <div className="suggestion-toolbar">
            <p>{chat.busy ? copy.waiting : dictMode ? "Ketik perkataan untuk terjemah, atau nombor (1–3) untuk pilih" : copy.suggestions}</p>
            <div className="toolbar-actions">
              <button
                type="button"
                className={`dict-toggle sticker-toggle${stickerDrawerOpen ? " is-active" : ""}`}
                onClick={e => {
                  e.stopPropagation();
                  setStickerDrawerOpen(v => !v);
                  setActiveWord(null);
                  setActiveReactionMsgId(null);
                }}
                aria-label="Buka emoji"
                aria-expanded={stickerDrawerOpen}
              >
                <Smile size={12} />
                Emoji
              </button>
              <button
                type="button"
                className={`dict-toggle${dictMode ? " is-active" : ""}`}
                onClick={e => {
                  e.stopPropagation();
                  setDictMode(v => !v);
                  setStickerDrawerOpen(false);
                  setActiveWord(null);
                  setActiveReactionMsgId(null);
                }}
              >
                <BookOpen size={12} />
                Translate
              </button>
            </div>
          </div>
          <ReplyChoices choices={chat.step.choices} disabled={!canSend} dictMode={dictMode} activeWordId={activeWord?.id} onChoose={choose} onSelectWord={selectWord} />
        </div> : <div className="complete-note">
          <Check size={16} />
          <span>{copy.endNote}</span>
          <button
            type="button"
            className={`dict-toggle sticker-toggle${stickerDrawerOpen ? " is-active" : ""}`}
            onClick={() => setStickerDrawerOpen(v => !v)}
          >
            <Smile size={12} />
            Emoji
          </button>
        </div>}
      </footer>
    </section>

    <CommunityDialog ref={dialog} />
  </main>;
}
