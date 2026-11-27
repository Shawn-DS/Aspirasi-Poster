"use client";

import { useEffect, useId, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  STATISTICS_VERSION,
  statisticsCatalog,
  type StatisticsSnapshot,
} from "./catalog";
import { roundedPercentages } from "./statisticsPresentation";
import "./statistics.css";

const numberFormat = new Intl.NumberFormat("ms-MY", { maximumFractionDigits: 1 });
const formatNumber = (value: number) => numberFormat.format(value);

function isSnapshot(value: unknown): value is StatisticsSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as StatisticsSnapshot;
  const validCount = (count: unknown) => Number.isSafeInteger(count) && Number(count) >= 0;
  const validChoice = (choice: unknown) => {
    if (!choice || typeof choice !== "object") return false;
    const item = choice as { id?: unknown; label?: unknown; short?: unknown; count?: unknown };
    return typeof item.id === "string" && typeof item.label === "string" && typeof item.short === "string" && validCount(item.count);
  };
  return (
    snapshot.version === STATISTICS_VERSION &&
    validCount(snapshot.started) &&
    validCount(snapshot.completed) &&
    Array.isArray(snapshot.questions) &&
    snapshot.questions.length === statisticsCatalog.length &&
    snapshot.questions.every(
      (question, index) =>
        question &&
        typeof question.id === "string" &&
        typeof question.title === "string" &&
        validCount(question.total) &&
        Array.isArray(question.choices) &&
        question.choices.length === statisticsCatalog[index].choices.length &&
        question.choices.every(validChoice),
    ) &&
    Array.isArray(snapshot.rankingSummary) &&
    snapshot.rankingSummary.length === 3
  );
}

export default function StatisticsDashboard({ refreshKey = 0, compact = false }: { refreshKey?: number; compact?: boolean }) {
  const [snapshot, setSnapshot] = useState<StatisticsSnapshot | null>(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const sectionId = useId();

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    setLoading(true);
    setFailed(false);
    void (async () => {
      try {
        const response = await fetch("/api/statistics", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Statistics unavailable");
        const payload: unknown = await response.json();
        if (!isSnapshot(payload)) throw new Error("Invalid statistics response");
        if (active) setSnapshot(payload);
      } catch {
        if (active) setFailed(true);
      } finally {
        window.clearTimeout(timeout);
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [refreshKey, revision]);

  const refresh = () => setRevision(current => current + 1);
  const decisionPhases = snapshot ? snapshot.questions.slice(0, 3) : [];
  const sortedRanking = snapshot
    ? [...snapshot.rankingSummary].sort((a, b) => {
        if (b.firstCount !== a.firstCount) return b.firstCount - a.firstCount;
        if (a.averageRank === null && b.averageRank === null) return 0;
        if (a.averageRank === null) return 1;
        if (b.averageRank === null) return -1;
        return a.averageRank - b.averageRank;
      })
    : [];
  const rankingTotal = sortedRanking.reduce((sum, item) => sum + item.firstCount, 0);
  const firstPcts = roundedPercentages(sortedRanking.map(item => item.firstCount));

  return (
    <section className={`statistics-dashboard${compact ? " is-compact" : ""}`} aria-labelledby={`${sectionId}-heading`}>
      <header className="statistics-heading">
        <h2 id={`${sectionId}-heading`}>Pilihan semua peserta</h2>
        {snapshot && (
          <span className="statistics-count-pill">{formatNumber(snapshot.completed)} sesi</span>
        )}
      </header>

      {failed && (
        <div className="statistics-error" role="alert">
          <p>{snapshot ? "Kemas kini gagal. Data sebelumnya masih dipaparkan." : "Statistik belum dapat dimuatkan."}</p>
          <button type="button" onClick={refresh} disabled={loading}>Cuba lagi</button>
        </div>
      )}

      {!snapshot && loading && (
        <div className="statistics-loading" role="status"><RefreshCw size={22} aria-hidden="true" /><p>Memuatkan statistik…</p></div>
      )}

      {snapshot && (
        <>
          {/* Primary Visual Focus: Interview Approval Across Stages 1 -> 3 */}
          <div className="statistics-section is-primary" aria-busy={loading}>
            <h3>Beri temu duga · Fasa 1 → 3</h3>

            <div className="statistics-barchart" role="list" aria-label="Carta palang kadar beri temu duga">
              {decisionPhases.map((phase, index) => {
                const interviewChoice = phase.choices.find(c => c.id === "interview");
                const declineChoice = phase.choices.find(c => c.id === "decline");
                const pcts = roundedPercentages([interviewChoice?.count ?? 0, declineChoice?.count ?? 0]);
                const yesPct = pcts[0] ?? 0;
                const phaseLabels = ["Awal", "+ Sijil", "+ Risiko"];
                return (
                  <div key={phase.id} className={`barchart-col col-${index + 1}`} role="listitem">
                    <span className="barchart-value">{formatNumber(yesPct)}%</span>
                    <div className="barchart-track" aria-hidden="true">
                      <div className="barchart-fill" style={{ height: `${Math.max(phase.total > 0 ? 8 : 0, yesPct)}%` }} />
                    </div>
                    <span className="barchart-label">{phaseLabels[index]}</span>
                    <small className="barchart-count">{formatNumber(interviewChoice?.count ?? 0)} / {formatNumber(phase.total)}</small>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secondary Section: #1 Priority Distribution */}
          <div className="statistics-section is-secondary" aria-busy={loading}>
            <h3>Keutamaan #1 peserta</h3>

            <ul className="statistics-ranking-list" aria-label="Peratusan pilihan #1 peserta">
              {sortedRanking.map((item, index) => {
                const pct = firstPcts[index] ?? 0;
                return (
                  <li key={item.id} className={index === 0 ? "is-leader" : undefined}>
                    <div className="ranking-stat-head">
                      <strong>{item.short}</strong>
                      <span className="ranking-pct">{formatNumber(pct)}%</span>
                    </div>
                    <div className="ranking-bar-track" role="img" aria-label={`${item.short}: ${formatNumber(pct)}%`}>
                      {rankingTotal > 0 && item.firstCount > 0 ? (
                        <span className="rk-fill" style={{ width: `${(item.firstCount / rankingTotal) * 100}%` }} />
                      ) : (
                        <span className="split-empty" />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="statistics-live" role="status">{loading ? "Statistik sedang dikemas kini." : ""}</p>
        </>
      )}
    </section>
  );
}
