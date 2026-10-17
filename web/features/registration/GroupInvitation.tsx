"use client";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole, MessageCircle } from "lucide-react";
import Avatar from "../chat/components/Avatar";
import { group } from "../chat/data/story";
import { useChatViewport } from "../chat/hooks/useChatViewport";
import ChatSimulator from "../chat/ChatSimulator";
import { sound } from "../chat/lib/sound";
import { MAX_STUDENT_ID_LENGTH, normalizeStudentId } from "./validation";

export default function GroupInvitation() {
  const [joined, setJoined] = useState(false);
  return joined ? <ChatSimulator /> : <InvitationForm onJoined={() => setJoined(true)} />;
}

function InvitationForm({ onJoined }: { onJoined: () => void }) {
  const [studentId, setStudentId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const root = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const { height: visibleHeight, keyboardOpen } = useChatViewport(root, input);

  useEffect(() => {
    sound.startBgm("thinking");
  }, []);

  useLayoutEffect(() => {
    const container = root.current;
    const field = input.current;
    if (!container || !field || document.activeElement !== field) return;
    // Keep both the focused field and the action below it above the keyboard.
    container.scrollTop += field.getBoundingClientRect().top - container.getBoundingClientRect().top - Math.min(90, container.clientHeight * .22);
  }, [visibleHeight, keyboardOpen, error]);

  async function join(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    if (!normalizeStudentId(studentId)) { setError("Sila masukkan Student ID anda."); input.current?.focus(); return; }
    sound.prime();
    submitting.current = true; setPending(true); setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/join", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }), signal: controller.signal,
      });
      const body: unknown = await response.json();
      const result = body && typeof body === "object" ? body as { ok?: unknown; error?: unknown } : {};
      if (!response.ok || result.ok !== true) throw new Error(typeof result.error === "string" ? result.error : "Sila cuba lagi.");
      input.current?.blur();
      window.scrollTo(0, 0);
      setStudentId("");
      onJoined();
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== "AbortError" && cause.name !== "TypeError" ? cause.message : "Tidak dapat menyambung. Student ID anda masih di sini, sila cuba lagi.");
    } finally {
      window.clearTimeout(timeout); submitting.current = false; setPending(false);
    }
  }

  return <main className={`join-screen${keyboardOpen ? " keyboard-open" : ""}`} ref={root} onPointerDown={() => sound.prime()}>
    <section className="join-poster" aria-labelledby="invitation-title">
      {/* Cream/Off-White background with soft WhatsApp sage organic curves */}
      <svg className="join-poster-bg" viewBox="0 0 400 820" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="cream-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbfaf4" />
            <stop offset="60%" stopColor="#f6f5ef" />
            <stop offset="100%" stopColor="#eef2ea" />
          </linearGradient>
          <linearGradient id="sage-wave-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e5efe0" />
            <stop offset="100%" stopColor="#d7e7d0" />
          </linearGradient>
          <linearGradient id="sage-wave-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d5e6ce" />
            <stop offset="100%" stopColor="#c5dcc0" />
          </linearGradient>
        </defs>

        {/* Base warm cream backdrop */}
        <rect width="400" height="820" fill="url(#cream-bg)" />

        {/* Top subtle scalloped seal + wavy line */}
        <path
          d="M140 0 Q148 22 158 14 Q168 34 180 20 Q192 40 205 22 Q218 40 230 20 Q242 34 252 14 Q262 22 270 0 Z"
          fill="#dcead6"
        />
        <path
          d="M132 0 C136 10 144 10 146 20 C148 30 158 28 162 36 C166 44 176 38 182 44 C188 50 198 40 205 44 C212 40 222 50 228 44 C234 38 244 44 248 36 C252 28 262 30 264 20 C266 10 274 10 278 0"
          fill="none"
          stroke="#12836c"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Soft sage circle orb on upper right */}
        <circle cx="315" cy="142" r="36" fill="#dfece0" />

        {/* Organic sweeping soft-sage wave */}
        <path
          d="M400 220 C315 260 295 360 225 395 C150 432 45 390 0 455 L0 820 L400 820 Z"
          fill="url(#sage-wave-1)"
        />
        <path
          d="M0 560 C115 535 285 540 400 565 L400 820 L0 820 Z"
          fill="url(#sage-wave-2)"
        />

        {/* Left decorative half-circle arc */}
        <path
          d="M0 118 A115 115 0 0 1 0 342"
          fill="none"
          stroke="#12836c"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.45"
        />
      </svg>

      {/* Top Bar: WhatsApp Pill Logo + Menu Lines */}
      <header className="join-poster-top">
        <div className="join-logo-pill">
          <span className="join-logo-text">WhatsApp</span>
          <span className="join-logo-dot"><MessageCircle size={13} /></span>
        </div>
        <div className="join-menu-lines" aria-hidden="true">
          <span /><span /><span />
        </div>
      </header>

      {/* Center Group Avatar Circle Frame + Group Title & Subtitle */}
      <div className="join-poster-center">
        <div className="join-group-ring">
          <div className="join-group-avatar">
            <Avatar group />
          </div>
        </div>
        <h1 id="invitation-title">{group.name}</h1>
        <p className="join-poster-sub">
          Sertai perbualan komuniti dan terokai 8 dilema etika bersama jiran baharu kita, Amir.
        </p>
      </div>

      {/* Bottom Rounded Action Dock: Student ID + Join Group Button + Potted Plant */}
      <div className="join-poster-dock">
        <form className="join-dock-form" onSubmit={join} noValidate aria-busy={pending}>
          <input
            id="student-id"
            ref={input}
            value={studentId}
            onChange={event => { setStudentId(event.target.value); if (error) setError(""); }}
            placeholder="Student ID"
            aria-label="Student ID"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={MAX_STUDENT_ID_LENGTH * 2}
            enterKeyHint="go"
            readOnly={pending}
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={`join-privacy${error ? " join-error" : ""}`}
          />
          {error && <p id="join-error" className="join-dock-error" role="alert">{error}</p>}
          <button className="join-dock-button" type="submit" disabled={pending}>
            {pending ? <><LoaderCircle className="join-spinner" size={19} />Sedang menyertai…</> : <>Join Group<ArrowRight size={19} /></>}
          </button>
          <p id="join-privacy" className="join-dock-privacy">
            <LockKeyhole size={11} />
            <span>Jawapan tidak disimpan</span>
          </p>
        </form>

        {/* Bottom-right potted plant accent */}
        <svg className="join-dock-plant" viewBox="0 0 80 110" aria-hidden="true">
          <path d="M38 68 C22 54 16 34 22 18 C32 28 38 46 40 68 Z" fill="#ffffff" stroke="#1e4d3b" strokeWidth="2" />
          <path d="M44 68 C42 42 50 18 62 8 C66 28 60 50 48 68 Z" fill="#dff3e5" stroke="#1e4d3b" strokeWidth="2" />
          <path d="M34 68 C20 62 12 52 10 42 C22 46 30 56 36 68 Z" fill="#12836c" />
          <path d="M48 68 C58 60 66 52 70 42 C60 46 52 56 46 68 Z" fill="#12836c" />
          <path d="M20 68 L62 68 L56 104 C55 108 52 110 48 110 L34 110 C30 110 27 108 26 104 Z" fill="#e09f3e" />
          <rect x="17" y="64" width="48" height="8" rx="4" fill="#f3b659" />
        </svg>
      </div>
    </section>
  </main>;
}
