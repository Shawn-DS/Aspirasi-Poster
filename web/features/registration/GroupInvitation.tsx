"use client";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Briefcase, LoaderCircle } from "lucide-react";
import Avatar from "../chat/components/Avatar";
import { copy, project } from "../chat/data/story";
import { useChatViewport } from "../chat/hooks/useChatViewport";
import ChatSimulator from "../chat/ChatSimulator";
import { sound } from "../chat/lib/sound";
import { MAX_STUDENT_ID_LENGTH, normalizeStudentId } from "./validation";
import { useStatistics } from "../statistics/useStatistics";

export default function GroupInvitation() {
  const [joined, setJoined] = useState(false);
  const statistics = useStatistics(joined);
  return joined ? (
    <ChatSimulator
      onAnswer={statistics.answer}
      onComplete={statistics.complete}
      statisticsState={statistics.state}
      onRetryStatistics={statistics.retry}
    />
  ) : (
    <InvitationForm onJoined={() => setJoined(true)} />
  );
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
    container.scrollTop +=
      field.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      Math.min(90, container.clientHeight * 0.22);
  }, [visibleHeight, keyboardOpen, error]);

  async function join(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    if (!normalizeStudentId(studentId)) {
      setError("Sila masukkan Student ID anda.");
      input.current?.focus();
      return;
    }
    sound.prime();
    submitting.current = true;
    setPending(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/join", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
        signal: controller.signal,
      });
      const body: unknown = await response.json();
      const result = body && typeof body === "object" ? (body as { ok?: unknown; error?: unknown }) : {};
      if (!response.ok || result.ok !== true) {
        throw new Error(typeof result.error === "string" ? result.error : "Sila cuba lagi.");
      }
      input.current?.blur();
      window.scrollTo(0, 0);
      setStudentId("");
      onJoined();
    } catch (cause) {
      setError(
        cause instanceof Error && cause.name !== "AbortError" && cause.name !== "TypeError"
          ? cause.message
          : "Tidak dapat menyambung. Student ID anda masih di sini, sila cuba lagi.",
      );
    } finally {
      window.clearTimeout(timeout);
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <main className={`join-screen${keyboardOpen ? " keyboard-open" : ""}`} ref={root} onPointerDown={() => sound.prime()}>
      <section className="join-poster" aria-labelledby="invitation-title">
        {/* Soft Color Bound watercolor paper washes + paint flecks */}
        <svg className="join-poster-bg" viewBox="0 0 400 820" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="cb-paper" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fdf7ed" />
              <stop offset="55%" stopColor="#fbf4e6" />
              <stop offset="100%" stopColor="#f5ebda" />
            </linearGradient>
            <radialGradient id="cb-peach" cx="22%" cy="14%" r="55%">
              <stop offset="0%" stopColor="#f2c6a6" stopOpacity="0.62" />
              <stop offset="65%" stopColor="#f2c6a6" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#f2c6a6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cb-butter" cx="85%" cy="28%" r="48%">
              <stop offset="0%" stopColor="#f4d58d" stopOpacity="0.52" />
              <stop offset="65%" stopColor="#f4d58d" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#f4d58d" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cb-sage" cx="76%" cy="76%" r="55%">
              <stop offset="0%" stopColor="#a7c9aa" stopOpacity="0.52" />
              <stop offset="65%" stopColor="#a7c9aa" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#a7c9aa" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cb-sky" cx="15%" cy="62%" r="45%">
              <stop offset="0%" stopColor="#9ec2d1" stopOpacity="0.44" />
              <stop offset="100%" stopColor="#9ec2d1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="820" fill="url(#cb-paper)" />
          <ellipse cx="90" cy="120" rx="220" ry="190" fill="url(#cb-peach)" />
          <ellipse cx="340" cy="230" rx="190" ry="180" fill="url(#cb-butter)" />
          <ellipse cx="70" cy="510" rx="180" ry="170" fill="url(#cb-sky)" />
          <ellipse cx="305" cy="630" rx="240" ry="230" fill="url(#cb-sage)" />
        </svg>

        <header className="join-poster-top">
          <div className="join-logo-pill">
            <span className="join-logo-text">{project.name}</span>
            <span className="join-logo-dot"><Briefcase size={13} /></span>
          </div>
          <span className="join-badge-year">MPU1032</span>
        </header>

        <div className="join-poster-center">
          <div className="join-emblem-sticker">
            <Avatar group />
          </div>

          <div className="join-title-group">
            <h1 id="invitation-title" className="join-title">{copy.title}</h1>
            <p className="join-kicker">{copy.titleAccent}</p>
          </div>

          <p className="join-poster-sub">{copy.loginSubtitle}</p>
        </div>

        <div className="join-poster-dock">
          <form className="join-dock-form" onSubmit={join} noValidate aria-busy={pending}>
            <input
              id="student-id"
              ref={input}
              value={studentId}
              onChange={event => {
                setStudentId(event.target.value);
                if (error) setError("");
              }}
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
              aria-describedby={error ? "join-error" : undefined}
            />
            {error && <p id="join-error" className="join-dock-error" role="alert">{error}</p>}
            <button className="join-dock-button" type="submit" disabled={pending}>
              {pending ? (
                <><LoaderCircle className="join-spinner" size={19} />Sedang masuk…</>
              ) : (
                <>Mulakan Simulasi<ArrowRight size={19} /></>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
