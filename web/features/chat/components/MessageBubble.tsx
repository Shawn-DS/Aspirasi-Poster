"use client";
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CheckCheck, UserPlus } from "lucide-react";
import type { WordLookupResult } from "../data/dictionary";
import {
  AUTO_EMOJI_REACTIONS,
  STICKER_BY_ID,
  STICKER_PACK,
  WHATSAPP_REACTION_EMOJIS,
} from "../data/stickers";
import { people, steps } from "../data/story";
import { sound } from "../lib/sound";
import type { ChatMessage, EthicsLens } from "../types";
import Avatar from "./Avatar";
import TranslatableText from "./TranslatableText";

const CHOICE_LENS_MAP: Record<string, EthicsLens> = Object.fromEntries(
  steps.flatMap(step => step.choices.map(choice => [choice.text, choice.lens])),
);

export function ChatStickerBubble({
  stickerId,
  time,
  own = false,
  autoReactEmoji,
}: {
  stickerId: string;
  time: string;
  own?: boolean;
  autoReactEmoji?: string;
}) {
  const [bouncing, setBouncing] = useState(false);
  const sticker = STICKER_BY_ID[stickerId] ?? STICKER_PACK[0];

  function triggerBounce() {
    sound.playMascotBoing();
    setBouncing(false);
    window.requestAnimationFrame(() => setBouncing(true));
  }

  return (
    <div className={`chat-sticker-row ${own ? "outgoing" : "incoming"}`}>
      <button
        type="button"
        className={`chat-sticker-card${bouncing ? " is-bouncing" : ""}`}
        onClick={triggerBounce}
        onAnimationEnd={() => setBouncing(false)}
        aria-label={`${sticker.caption} (${sticker.meaning})`}
        title={`${sticker.caption} · ${sticker.meaning}`}
      >
        <div className="chat-sticker-art">
          <img
            src={sticker.src}
            alt={sticker.caption}
            className="chat-sticker-img"
            draggable={false}
          />
          <span className="chat-sticker-caption" style={{ backgroundColor: sticker.color }}>
            {sticker.caption}
          </span>
        </div>
        <span className="chat-sticker-time">
          <time>{time}</time>
          {own && <CheckCheck size={14} aria-label="Dihantar dalam simulasi" />}
        </span>
        {autoReactEmoji && (
          <span className="message-reaction-pill sticker-reaction own-reaction" aria-hidden="true">
            <span>{autoReactEmoji}</span>
          </span>
        )}
      </button>
    </div>
  );
}

export default memo(function MessageBubble({
  message,
  showSender,
  activeWordId,
  reactionOpen,
  onOpenReaction,
  onCloseReaction,
  onReact,
  onSelectWord,
}: {
  message: ChatMessage;
  showSender: boolean;
  activeWordId?: string | null;
  reactionOpen?: boolean;
  onOpenReaction?: (messageId: number) => void;
  onCloseReaction?: () => void;
  onReact?: (message: ChatMessage, emoji: string | null) => void;
  onSelectWord: (id: string, lookup: WordLookupResult, target: HTMLElement) => void;
}) {
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [pressing, setPressing] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const didLongPressRef = useRef(false);
  const bubble = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0, width: 282 });
  useLayoutEffect(() => {
    if (!reactionOpen || !bubble.current) return;
    const element = bubble.current;
    const body = element.closest(".chat-body")!;
    const measure = () => {
      const bounds = element.getBoundingClientRect();
      const viewport = body.getBoundingClientRect();
      const width = Math.min(282, viewport.width - 12);
      const left = Math.max(viewport.left + 6, Math.min(bounds.left, viewport.right - width - 6));
      const top = Math.max(viewport.top + 6, Math.min(bounds.top - 60, viewport.bottom - 60));
      setMenuPosition({ left: left - bounds.left, top: top - bounds.top, width });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    body.addEventListener("scroll", measure, { passive: true });
    return () => { observer.disconnect(); body.removeEventListener("scroll", measure); };
  }, [reactionOpen]);

  const ownLens = useMemo(() => {
    if (message.sender !== "you") return undefined;
    return CHOICE_LENS_MAP[message.text];
  }, [message.sender, message.text]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

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
  const autoReaction = ownLens ? AUTO_EMOJI_REACTIONS[ownLens] : null;
  const showAmirSticker = message.sender === "amir" && message.text.includes("membina hidup baharu");
  const showHarmonySticker = message.sender === "admin" && message.text.includes("🌿");

  function clearLongPressTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPressing(false);
  }

  function triggerReactionMenu() {
    if (didLongPressRef.current) return;
    didLongPressRef.current = true;
    setPressing(false);
    sound.playReactionPop();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(18);
      } catch {}
    }
    onOpenReaction?.(message.id);
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (e.button !== undefined && e.button !== 0) return;
    didLongPressRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    clearLongPressTimer();
    setPressing(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      triggerReactionMenu();
    }, 360);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!startPosRef.current || timerRef.current === null) return;
    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);
    if (dx > 10 || dy > 10) {
      clearLongPressTimer();
    }
  }

  function handlePointerUpOrCancel() {
    clearLongPressTimer();
  }

  function handleClickCapture(e: React.MouseEvent) {
    // The release click belongs to the held message, never to the next control.
    if ((e.target as HTMLElement).closest(".whatsapp-reaction-popover, .user-reaction")) {
      didLongPressRef.current = false;
      return;
    }
    if (didLongPressRef.current) {
      e.stopPropagation();
      e.preventDefault();
      didLongPressRef.current = false;
    }
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    clearLongPressTimer();
    triggerReactionMenu();
  }

  function handleSelectReaction(emoji: string) {
    didLongPressRef.current = false;
    sound.playReactionPop();
    const next = userReaction === emoji ? null : emoji;
    setUserReaction(next);
    onReact?.(message, next);
    onCloseReaction?.();
  }

  return (
    <>
      <article
        className={`message-row ${own ? "outgoing" : "incoming"} ${showSender ? "new-sender" : "continued"}${autoReaction || userReaction ? " has-reaction" : ""}${reactionOpen ? " is-reacting" : ""}`}
        aria-label={person.name}
      >
        {!own && <div className="message-avatar">{showSender && <Avatar sender={message.sender} />}</div>}
        <div
          ref={bubble}
          className={`message-bubble${pressing ? " is-pressing" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          onPointerLeave={handlePointerUpOrCancel}
          onClickCapture={handleClickCapture}
          onKeyDown={e => {
            if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              didLongPressRef.current = false;
              triggerReactionMenu();
            }
            if (e.key === "Escape") onCloseReaction?.();
          }}
          tabIndex={0}
          aria-label={`Reaksi kepada mesej ${person.name}`}
          onContextMenu={handleContextMenu}
        >
          {showSender && !own && (
            <strong className="sender-name" style={{ color: person.color }}>
              {person.name}
            </strong>
          )}
          <p>
            <TranslatableText text={message.text} prefixId={`msg-${message.id}`} activeId={activeWordId} onSelectWord={onSelectWord} />
          </p>
          <span className="message-time">
            <time>{message.time}</time>
            {own && <CheckCheck size={15} aria-label="Dihantar dalam simulasi" />}
          </span>

          {/* Automatic neighbour emoji reactions on player's chosen response */}
          {own && autoReaction && !userReaction && (
            <div className="message-reaction-pill own-reaction" title={autoReaction.label} aria-label={autoReaction.label}>
              <span>{autoReaction.emojis[0]}</span>
              <span>{autoReaction.emojis[1]}</span>
              <b>2</b>
            </div>
          )}

          {/* User's chosen emoji reaction pill */}
          {userReaction && (
            <button
              type="button"
              className={`message-reaction-pill user-reaction${own ? " own-reaction" : ""}`}
              onPointerDown={e => e.stopPropagation()}
              onClick={e => {
                e.stopPropagation();
                sound.playReactionPop();
                if (reactionOpen) onCloseReaction?.();
                else onOpenReaction?.(message.id);
              }}
              aria-label={`Tukar reaksi ${userReaction}`}
              title="Ketik untuk tukar reaksi"
            >
              {own && autoReaction && (
                <>
                  <span>{autoReaction.emojis[0]}</span>
                  <span>{autoReaction.emojis[1]}</span>
                </>
              )}
              <span>{userReaction}</span>
              {own && autoReaction && <b>3</b>}
            </button>
          )}

          {/* WhatsApp Long-Press Classic Emoji Reaction Bar */}
          {reactionOpen && (
            <div
              className={`whatsapp-reaction-popover ${own ? "align-right" : "align-left"}`}
              style={menuPosition}
              role="dialog"
              aria-label="Pilih reaksi emoji"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => e.stopPropagation()}
            >
              <div className="reaction-quick-bar">
                {WHATSAPP_REACTION_EMOJIS.map(item => (
                  <button
                    key={item.emoji}
                    type="button"
                    className={`reaction-emoji-btn${userReaction === item.emoji ? " is-selected" : ""}`}
                    onClick={() => handleSelectReaction(item.emoji)}
                    aria-label={item.label}
                    title={item.label}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
      {showAmirSticker && <ChatStickerBubble stickerId="s12" time={message.time} />}
      {showHarmonySticker && <ChatStickerBubble stickerId="s23" time={message.time} />}
    </>
  );
});
