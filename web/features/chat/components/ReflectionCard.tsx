"use client";
import { RotateCcw, Sparkles } from "lucide-react";
import type { WordLookupResult } from "../data/dictionary";
import { copy, ethicsLensMeta } from "../data/story";
import type { EthicsCounts, EthicsLens, EthicsProfile, EthicsProfileId } from "../types";
import EthicsSticker from "./EthicsSticker";
import TranslatableText from "./TranslatableText";

const LENS_ORDER: EthicsLens[] = ["deontology", "utilitarianism", "care"];
export const MAX_MASCOT_QUOTES = 3;

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

export default function ReflectionCard({
  ethicsProfile,
  counts,
  totalSteps,
  mascotPokes,
  activeWordId,
  onPokeMascot,
  onSelectWord,
  onRestart,
}: {
  ethicsProfile: EthicsProfile;
  counts: EthicsCounts;
  totalSteps: number;
  mascotPokes: number;
  activeWordId?: string | null;
  onPokeMascot: (e: React.MouseEvent) => void;
  onSelectWord: (id: string, lookup: WordLookupResult, target: HTMLElement) => void;
  onRestart: () => void;
}) {
  const profileQuotes = MASCOT_QUOTES[ethicsProfile.id];
  const activeMascotQuote =
    mascotPokes > 0 && mascotPokes <= MAX_MASCOT_QUOTES
      ? profileQuotes[mascotPokes - 1]
      : null;

  return (
    <section className={`reflection-card profile-${ethicsProfile.id}`} aria-labelledby="reflection-title">
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
          onClick={onPokeMascot}
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
          <EthicsSticker type={ethicsProfile.id} size={96} className="reflection-mascot" />
          {mascotPokes < MAX_MASCOT_QUOTES && (
            <span className="mascot-tap-hint">
              <Sparkles size={11} />
              {mascotPokes === 0 ? "Ketik saya!" : `Ketik lagi (${mascotPokes}/${MAX_MASCOT_QUOTES})`}
            </span>
          )}
        </button>
      </div>
      <p className="reflection-ethics-badge">{ethicsProfile.badge}</p>
      <h2 id="reflection-title">
        <TranslatableText text={ethicsProfile.title} prefixId="ref-title" activeId={activeWordId} onSelectWord={onSelectWord} />
      </h2>
      <div className="reflection-ethics">
        <ul className="ethics-breakdown" aria-label={copy.ethicsResultLabel}>
          {LENS_ORDER.map(lens => {
            const count = counts[lens];
            const pct = Math.round((count / totalSteps) * 100);
            return (
              <li key={lens} className={`lens-${lens}`}>
                <div className="ethics-row-head">
                  <strong>
                    {ethicsLensMeta[lens].name} <span>({ethicsLensMeta[lens].subtitle})</span>
                  </strong>
                  <b>
                    {count} / {totalSteps}
                  </b>
                </div>
                <div className="ethics-row-bar" aria-hidden="true">
                  <i style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="reflection-ethics-summary">
          <TranslatableText text={ethicsProfile.summary} prefixId="ref-sum" activeId={activeWordId} onSelectWord={onSelectWord} />
        </p>
      </div>
      <button type="button" onClick={onRestart}>
        <RotateCcw size={15} />
        {copy.restart}
      </button>
    </section>
  );
}
