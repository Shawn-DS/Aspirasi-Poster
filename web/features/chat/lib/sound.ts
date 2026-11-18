import type { EthicsLens } from "../types";

const THINKING_START = 5.2;
const THINKING_END = 183.0;
const COMPLETE_START = 184.8;
const COMPLETE_END = 207.2;

// Background music player (/bgm.mp3) + Web Audio synthesizer for ethical choice SFX.
class SoundController {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bgm: HTMLAudioElement | null = null;
  private mode: "thinking" | "complete" = "thinking";
  private active = false;
  private muted = false;
  private visibilityBound = false;
  private unlockBound = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.85;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private seekToSegmentStart(audio: HTMLAudioElement, targetMode: "thinking" | "complete") {
    const start = targetMode === "complete" ? COMPLETE_START : THINKING_START;
    try {
      audio.currentTime = start;
    } catch {
      const onLoaded = () => {
        try { audio.currentTime = start; } catch {}
        audio.removeEventListener("loadedmetadata", onLoaded);
      };
      audio.addEventListener("loadedmetadata", onLoaded);
    }
  }

  private bindUnlockListeners() {
    if (this.unlockBound || typeof window === "undefined") return;
    this.unlockBound = true;
    const resumeAudio = () => {
      if (!this.active || this.muted) return;
      this.ensureContext();
      if (this.bgm && this.bgm.paused) {
        if (this.bgm.currentTime < THINKING_START) {
          this.seekToSegmentStart(this.bgm, this.mode);
        }
        this.bgm.play().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", resumeAudio, { passive: true });
    window.addEventListener("keydown", resumeAudio, { passive: true });
  }

  private ensureBgm(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    this.bindUnlockListeners();
    if (!this.bgm) {
      const audio = new Audio("/bgm.mp3");
      audio.preload = "auto";
      audio.volume = 0.14;
      audio.muted = this.muted;
      audio.addEventListener("loadedmetadata", () => {
        if (audio.currentTime < THINKING_START) {
          this.seekToSegmentStart(audio, this.mode);
        }
      });
      audio.addEventListener("timeupdate", () => {
        if (this.mode === "thinking") {
          if (audio.currentTime < THINKING_START - 0.5 || audio.currentTime >= THINKING_END) {
            this.seekToSegmentStart(audio, "thinking");
          }
        } else {
          if (audio.currentTime < COMPLETE_START - 0.5 || audio.currentTime >= COMPLETE_END) {
            this.seekToSegmentStart(audio, "complete");
          }
        }
      });
      audio.addEventListener("ended", () => {
        this.seekToSegmentStart(audio, this.mode);
        if (this.active && !this.muted) {
          audio.play().catch(() => {});
        }
      });
      this.bgm = audio;
    }
    if (!this.visibilityBound && typeof document !== "undefined") {
      this.visibilityBound = true;
      document.addEventListener("visibilitychange", () => {
        if (!this.bgm) return;
        if (document.hidden) {
          this.bgm.pause();
        } else if (this.active && !this.muted) {
          this.bgm.play().catch(() => {});
        }
      });
    }
    return this.bgm;
  }

  private playTone(
    freq: number,
    startOffset: number,
    duration: number,
    type: OscillatorType,
    peakGain: number,
    endFreq?: number,
  ) {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.muted) return;
    const t0 = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + duration);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peakGain, t0 + Math.min(0.018, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  prime() {
    this.ensureContext();
    const bgm = this.ensureBgm();
    if (bgm && !this.muted) {
      this.active = true;
      if (bgm.currentTime < THINKING_START) {
        this.seekToSegmentStart(bgm, this.mode);
      }
      bgm.play().catch(() => {});
    }
  }

  startBgm(mode: "thinking" | "complete" = "thinking") {
    const modeChanged = this.mode !== mode;
    this.mode = mode;
    this.active = true;
    const bgm = this.ensureBgm();
    if (bgm) {
      bgm.muted = this.muted;
      bgm.volume = mode === "complete" ? 0.13 : 0.14;
      if (modeChanged) {
        this.seekToSegmentStart(bgm, mode);
      } else if (mode === "thinking" && (bgm.currentTime < THINKING_START || bgm.currentTime >= THINKING_END)) {
        this.seekToSegmentStart(bgm, "thinking");
      } else if (mode === "complete" && bgm.currentTime < COMPLETE_START) {
        this.seekToSegmentStart(bgm, "complete");
      }
      if (!this.muted && bgm.paused) {
        bgm.play().catch(() => {});
      }
    }
  }

  stopBgm() {
    this.active = false;
    if (this.bgm) {
      this.bgm.pause();
    }
  }

  setMuted(nextMuted: boolean) {
    this.muted = nextMuted;
    if (!nextMuted) this.ensureContext();
    if (this.master && this.ctx) {
      this.master.gain.setValueAtTime(nextMuted ? 0 : 0.85, this.ctx.currentTime);
    }
    if (this.bgm) {
      this.bgm.muted = nextMuted;
      if (!nextMuted && this.active && this.bgm.paused) {
        this.bgm.play().catch(() => {});
      }
    }
  }

  isMuted() {
    return this.muted;
  }

  // Distinct SFX for each ethical framework
  playChoiceSfx(lens: EthicsLens) {
    if (!this.ensureContext() || this.muted) return;
    if (lens === "deontology") {
      this.playTone(155, 0, 0.16, "triangle", 0.42, 62);
      this.playTone(587.33, 0.02, 0.32, "sine", 0.22);
      this.playTone(880.0, 0.05, 0.38, "sine", 0.18);
    } else if (lens === "utilitarianism") {
      const ripple = [523.25, 659.25, 783.99, 1046.5];
      ripple.forEach((freq, i) => {
        this.playTone(freq, i * 0.065, 0.28, "sine", 0.2);
      });
    } else if (lens === "care") {
      this.playTone(196.0, 0, 0.14, "sine", 0.32, 140);
      this.playTone(220.0, 0.14, 0.18, "sine", 0.34, 165);
      this.playTone(523.25, 0.06, 0.42, "sine", 0.16);
      this.playTone(659.25, 0.14, 0.45, "sine", 0.18);
    }
  }

  // Subtle bubble pop when a neighbour message arrives
  playMessagePop() {
    if (!this.ctx || this.muted) return;
    this.playTone(540, 0, 0.055, "sine", 0.08, 760);
  }

  // Cute pop when reacting to a message with an emoji
  playReactionPop() {
    if (!this.ensureContext() || this.muted) return;
    this.playTone(480, 0, 0.07, "sine", 0.16, 860);
    this.playTone(920, 0.05, 0.09, "triangle", 0.12, 1180);
  }

  // Playful boing + sparkle chime when tapping the ethics mascot
  playMascotBoing() {
    if (!this.ensureContext() || this.muted) return;
    this.playTone(320, 0, 0.14, "sine", 0.22, 680);
    this.playTone(659.25, 0.07, 0.16, "triangle", 0.16, 987.77);
    this.playTone(1318.5, 0.13, 0.22, "sine", 0.14);
  }
}

export const sound = new SoundController();
