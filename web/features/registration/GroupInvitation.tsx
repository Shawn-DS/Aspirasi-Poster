"use client";
import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, Leaf, LoaderCircle, LockKeyhole, MessageCircle, Users } from "lucide-react";
import Avatar from "../chat/components/Avatar";
import { group } from "../chat/data/story";
import { useChatViewport } from "../chat/hooks/useChatViewport";
import ChatSimulator from "../chat/ChatSimulator";
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
  const { height: visibleHeight } = useChatViewport(root, input);
  useLayoutEffect(() => {
    const container = root.current;
    const field = input.current;
    if (!container || !field || document.activeElement !== field) return;
    // Keep both the focused field and the action below it above the keyboard.
    container.scrollTop += field.getBoundingClientRect().top - container.getBoundingClientRect().top - Math.min(120, container.clientHeight * .3);
  }, [visibleHeight, error]);

  async function join(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    if (!normalizeStudentId(studentId)) { setError("Sila masukkan nombor matrik antara 1 hingga 80 aksara."); input.current?.focus(); return; }
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
      setStudentId("");
      onJoined();
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== "AbortError" && cause.name !== "TypeError" ? cause.message : "Tidak dapat menyambung. Nombor matrik anda masih di sini; sila cuba lagi.");
    } finally {
      window.clearTimeout(timeout); submitting.current = false; setPending(false);
    }
  }

  return <main className="join-screen" ref={root}>
    <header className="join-brand"><MessageCircle size={24} /><strong>WhatsApp</strong><span>JEMPUTAN KUMPULAN</span></header>
    <div className="join-layout"><section className="invitation-card" aria-labelledby="invitation-title">
      <div className="invitation-cover"><span className="invitation-tag"><Leaf size={13} />PELUANG KEDUA</span><Avatar group /><span className="invitation-spark">✦</span></div>
      <div className="invitation-content"><p className="invitation-eyebrow">ANDA DIJEMPUT UNTUK MENYERTAI</p><h1 id="invitation-title">{group.name}</h1>
        <p className="invitation-byline"><Users size={14} />Dijemput oleh Admin Komuniti</p>
        <div className="invitation-neighbours"><div className="invitation-faces"><Avatar sender="aina" /><Avatar sender="lim" /><Avatar sender="admin" /></div><p>Jiran anda sedang berbual.<br /><strong>Satu mesej boleh membuka satu peluang.</strong></p></div>
        <p className="invitation-description">Patutkah seseorang diberi peluang kedua? Sertai perbualan dan temui Amir, jiran baharu kita.</p>
        <form className="join-form" onSubmit={join} noValidate aria-busy={pending}>
          <label htmlFor="student-id">Nombor matrik <span>Wajib</span></label>
          <input id="student-id" ref={input} value={studentId} onChange={event => { setStudentId(event.target.value); if (error) setError(""); }} placeholder="Contoh: 24012345" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={MAX_STUDENT_ID_LENGTH * 2} enterKeyHint="go" readOnly={pending} aria-required="true" aria-invalid={!!error} aria-describedby={`join-privacy${error ? " join-error" : ""}`} />
          <p id="join-privacy" className="join-privacy"><LockKeyhole size={13} /><span>Nombor matrik dan masa penyertaan disimpan untuk rekod penganjur. Jawapan serta mesej anda tidak direkodkan.</span></p>
          {error && <p id="join-error" className="join-error" role="alert">{error}</p>}
          <button className="join-button" type="submit" disabled={pending}>{pending ? <><LoaderCircle className="join-spinner" size={19} />Sedang menyertai…</> : <>Join Group<ArrowRight size={19} /></>}</button>
        </form>
        <p className="join-footnote"><Check size={13} />8 dilema etika · Deontologi, Utilitarianisme &amp; Care</p>
      </div>
    </section><p className="join-disclosure">Simulasi perbualan rekaan untuk aktiviti MPU1032.<br />{group.subject}</p></div>
  </main>;
}
