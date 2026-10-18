"use client";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, BookOpen, Check, Clock3, Info, Leaf, MessageCircle, RotateCcw, ShieldCheck, Smile, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import type { WordLookupResult } from "./data/dictionary";
import { STICKER_PACK } from "./data/stickers";
import { communityProfiles, copy, ethicsLensMeta, group, people } from "./data/story";
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
import TranslatableText, { type ActiveWordState } from "./components/TranslatableText";
import type { EthicsLens, EthicsProfileId } from "./types";

const LENS_ORDER: EthicsLens[] = ["deontology", "utilitarianism", "care"];

const CHAPTER_MASCOT_LABELS: Record<EthicsProfileId | "seed", string> = {
  seed: "🌱 Tunas Etika",
  deontology: "⚖️ Deontologi",
  utilitarianism: "🌟 Utilitarianisme",
  care: "💖 Ethics of Care",
  balanced: "🌿 Seimbang",
};

const MAX_MASCOT_QUOTES = 3;

const MASCOT_QUOTES: Record<EthicsProfileId, [string, string, string]> = {
  deontology: [
    "Prinsip yang teguh melindungi maruah setiap insan! ⚖️✨",
    "Hak setara untuk semua jiran di Taman Harmoni! 🤝",
    "Keadilan bukan sekadar ehsan, tetapi tanggungjawab bersama! 📜",
  ],
  utilitarianism: [
    "Keharmonian dan keselamatan kejiranan terjaga bersama! 🌟🏡",
    "Langkah bijak mengimbangi ketenteraman ramai dan peluang kedua! 🛡️",
    "Komuniti yang teratur melahirkan kejiranan yang sejahtera! 🤝",
  ],
  care: [
    "Empati anda membina jambatan kepercayaan di Taman Harmoni! 💖🌱",
    "Mendengar dengan hati mengubah rasa takut menjadi persefahaman! 🥹",
    "Amir pasti menghargai sapaan dan keprihatinan anda! 🌸",
  ],
  balanced: [
    "Hebat! Anda bijak mengimbangi prinsip, keselamatan dan empati! 🌿✨",
    "Tiga perspektif etika berpadu untuk keharmonian Taman Harmoni! ⚖️🌟💖",
    "Setiap situasi dinilai dengan matang dan berhemah! 🤝",
  ],
};

export default function ChatSimulator() {
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
  const { height: visibleHeight } = useChatViewport(root);

  const answeredCount = chat.counts.deontology + chat.counts.utilitarianism + chat.counts.care;
  const miniMascotState: EthicsProfileId | "seed" = answeredCount === 0 ? "seed" : chat.ethicsProfile.id;

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

  const profileQuotes = MASCOT_QUOTES[chat.ethicsProfile.id];
  const activeMascotQuote =
    mascotPokes > 0 && mascotPokes <= MAX_MASCOT_QUOTES
      ? profileQuotes[mascotPokes - 1]
      : null;

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
          <small>{chat.complete ? copy.stepEnd : `${Math.min(chat.turn + 1, chat.totalSteps)} / ${chat.totalSteps}`}</small>
        </div>
        <div className="chapter-progress" aria-hidden="true">
          <i style={{ width: `${chat.complete ? 100 : Math.round(((chat.turn + 1) / chat.totalSteps) * 100)}%` }} />
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
        {chat.complete && <section className={`reflection-card profile-${chat.ethicsProfile.id}`} aria-labelledby="reflection-title">
          <div className="reflection-drip" aria-hidden="true">
            <svg viewBox="0 0 400 28" preserveAspectRatio="none">
              <path d="M0 0 H400 V12 C382 12 376 26 360 26 C344 26 340 10 322 10 C304 10 298 24 280 24 C262 24 256 11 238 11 C220 11 214 27 196 27 C178 27 172 10 154 10 C136 10 130 25 112 25 C94 25 88 11 70 11 C52 11 46 24 28 24 C12 24 8 12 0 12 Z" />
            </svg>
          </div>
          <div className="reflection-mascot-wrap">
            {activeMascotQuote && (
              <div key={mascotPokes} className="reflection-mascot-speech" role="status">
                {activeMascotQuote}
              </div>
            )}
            <button
              key={mascotPokes}
              type="button"
              className={`reflection-mascot-btn${mascotPokes > 0 ? " is-poked" : ""}`}
              onClick={handleReflectionMascotClick}
              disabled={mascotPokes >= MAX_MASCOT_QUOTES}
              aria-label="Ketik maskot etika untuk mesej semangat"
              title={mascotPokes < MAX_MASCOT_QUOTES ? "Ketik maskot!" : undefined}
            >
              {mascotPokes > 0 && (
                <span className="mascot-poke-sparkles" aria-hidden="true">
                  <i className="sp-1">✨</i>
                  <i className="sp-2">🌟</i>
                  <i className="sp-3">💫</i>
                </span>
              )}
              <EthicsSticker type={chat.ethicsProfile.id} size={96} className="reflection-mascot" />
              {mascotPokes < MAX_MASCOT_QUOTES && (
                <span className="mascot-tap-hint">
                  <Sparkles size={11} />
                  {mascotPokes === 0 ? "Ketik saya!" : `Ketik lagi (${mascotPokes}/${MAX_MASCOT_QUOTES})`}
                </span>
              )}
            </button>
          </div>
          <p className="reflection-ethics-badge">{chat.ethicsProfile.badge}</p>
          <h2 id="reflection-title"><TranslatableText text={chat.ethicsProfile.title} prefixId="ref-title" activeId={activeWord?.id} onSelectWord={selectWord} /></h2>
          <div className="reflection-ethics">
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
            <p className="reflection-ethics-summary"><TranslatableText text={chat.ethicsProfile.summary} prefixId="ref-sum" activeId={activeWord?.id} onSelectWord={selectWord} /></p>
          </div>
          <button onClick={restart}><RotateCcw size={15} />{copy.restart}</button>
        </section>}
      </div>
      {activeWord && <div
        className={`word-popover ${activeWord.placeBelow ? "place-below" : "place-above"}`}
        style={{
          left: `${activeWord.x}px`,
          top: `${activeWord.placeBelow ? activeWord.bottom + 8 : activeWord.y - 8}px`,
        }}
        role="status"
        aria-live="polite"
        onClick={e => e.stopPropagation()}
      >
        <div className="word-popover-head">
          <strong>{activeWord.lookup.word}</strong>
          {activeWord.lookup.key !== activeWord.lookup.word.toLowerCase() && <span className="word-popover-stem">({activeWord.lookup.key})</span>}
          <button type="button" className="word-popover-close" aria-label="Tutup terjemahan" onClick={() => setActiveWord(null)}><X size={13} /></button>
        </div>
        <div className="word-popover-row"><span className="word-lang-badge zh">中文</span><span>{activeWord.lookup.zh}</span></div>
        <div className="word-popover-row"><span className="word-lang-badge en">EN</span><span>{activeWord.lookup.en}</span></div>
      </div>}
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
          <div className="sticker-drawer" role="dialog" aria-label="Emoji komuniti" style={{ maxHeight: drawerHeight }} onKeyDown={e => { if (e.key === "Escape") setStickerDrawerOpen(false); }}>
            <div className="sticker-drawer-head">
              <strong>Emoji Komuniti · 8 pilihan</strong>
              <button
                type="button"
                className="sticker-drawer-close"
                onClick={() => setStickerDrawerOpen(false)}
                aria-label="Tutup emoji"
              >
                <X size={15} />
              </button>
            </div>
            <div className="sticker-drawer-grid">
              {STICKER_PACK.map(stk => (
                <button
                  key={stk.id}
                  type="button"
                  className="sticker-drawer-item"
                  onClick={() => handleSendSticker(stk.id)}
                  aria-label={`Hantar ${stk.caption} (${stk.meaning})`}
                  title={`${stk.caption} · ${stk.meaning}`}
                >
                  <img src={stk.src} alt={stk.caption} loading="lazy" draggable={false} />
                  <strong className="sticker-item-caption" style={{ backgroundColor: stk.color }}>
                    {stk.caption}
                  </strong>
                  <span className="sticker-item-meaning">{stk.meaning}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {!chat.complete ? <div className="suggestion-area">
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
                {dictMode ? "Mod Pilih" : "Terjemah Pilihan"}
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

    <dialog className="about-dialog community-dialog" ref={dialog} aria-labelledby="community-title" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}><div className="dialog-heading"><Avatar group /><button className="icon-button" aria-label={copy.close} onClick={() => dialog.current?.close()}><X size={21} /></button></div><p className="eyebrow">PERSATUAN PENDUDUK</p><h2 id="community-title">{copy.about}</h2><p className="community-subtitle">{copy.aboutSubtitle}</p><div className="community-announcement"><span>{copy.announcementLabel}</span><p>{copy.announcement}</p></div><p>{copy.aboutText}</p><p className="eyebrow profile-label">{copy.peopleLabel}</p><ul className="community-people">{communityProfiles.map(profile => <li key={profile.sender}><Avatar sender={profile.sender} /><div><strong style={{ color: people[profile.sender].color }}>{people[profile.sender].name}</strong><span>{profile.role}</span><p>{profile.description}</p></div></li>)}</ul><div className="community-question"><Leaf size={21} /><p>{copy.communityQuestion}</p></div><p className="community-simulation">{copy.simulationNote}</p><button className="dialog-close" onClick={() => dialog.current?.close()}>{copy.backToChat}</button></dialog>
  </main>;
}
