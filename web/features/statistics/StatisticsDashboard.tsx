"use client";

import { useEffect, useId, useState } from "react";
import { Download, RefreshCw, Users } from "lucide-react";
import {
  STATISTICS_VERSION,
  statisticsCatalog,
  statisticsLenses,
  type StatisticsSnapshot,
} from "./catalog";
import { roundedPercentages } from "./statisticsPresentation";
import "./statistics.css";

const colors = ["#147567", "#d49442", "#a35b78"];
const numberFormat = new Intl.NumberFormat("ms-MY", { maximumFractionDigits: 1 });
const formatNumber = (value: number) => numberFormat.format(value);

function isSnapshot(value: unknown): value is StatisticsSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as StatisticsSnapshot;
  const validCount = (count: unknown) => Number.isSafeInteger(count) && Number(count) >= 0;
  const validChoice = (choice: unknown) => {
    if (!choice || typeof choice !== "object") return false;
    const item = choice as { id?: unknown; label?: unknown; count?: unknown };
    return typeof item.id === "string" && typeof item.label === "string" && validCount(item.count);
  };
  return snapshot.version === STATISTICS_VERSION && validCount(snapshot.started) && validCount(snapshot.completed)
    && Array.isArray(snapshot.lenses) && snapshot.lenses.length === statisticsLenses.length && snapshot.lenses.every(validChoice)
    && Array.isArray(snapshot.questions) && snapshot.questions.length === statisticsCatalog.length
    && snapshot.questions.every((question, index) => question && typeof question.id === "string"
      && typeof question.title === "string" && validCount(question.total)
      && Array.isArray(question.choices) && question.choices.length === statisticsCatalog[index].choices.length
      && question.choices.every(validChoice));
}

export default function StatisticsDashboard({ refreshKey = 0 }: { refreshKey?: number }) {
  const [snapshot, setSnapshot] = useState<StatisticsSnapshot | null>(null);
  const [selected, setSelected] = useState<string>("overall");
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

  const question = snapshot?.questions.find((item) => item.id === selected);
  const slices = question?.choices ?? snapshot?.lenses ?? [];
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const percentages = roundedPercentages(slices.map((slice) => slice.count));
  const title = question?.title ?? "Perspektif etika komuniti";
  const refresh = () => setRevision((current) => current + 1);

  return (
    <section className="statistics-dashboard" aria-labelledby={`${sectionId}-heading`}>
      <header className="statistics-heading">
        <span className="statistics-symbol" aria-hidden="true"><Users size={22} /></span>
        <div>
          <p className="statistics-kicker">TAMAN HARMONI</p>
          <h2 id={`${sectionId}-heading`}>Pilihan komuniti</h2>
          <p className="statistics-subtitle">Statistik tanpa nama atau nombor pelajar.</p>
        </div>
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
          <dl className="statistics-totals">
            <div><dt>Sesi bermula</dt><dd>{formatNumber(snapshot.started)}</dd></div>
            <div><dt>Sesi selesai</dt><dd>{formatNumber(snapshot.completed)}</dd></div>
          </dl>

          <div className="statistics-selector" role="group" aria-label="Pilih carta statistik">
            <button type="button" aria-pressed={!question} onClick={() => setSelected("overall")}>Keseluruhan</button>
            {snapshot.questions.map((item, index) => (
              <button type="button" key={item.id} aria-label={`Dilema ${index + 1}`} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>{index + 1}</button>
            ))}
          </div>

          <div className="statistics-chart-panel" aria-busy={loading}>
            <h3 id={`${sectionId}-chart-heading`}>{title}</h3>
            <figure className="statistics-figure" aria-labelledby={`${sectionId}-chart-heading`}>
              <div className="statistics-doughnut">
                <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#e5eadd" strokeWidth="18" />
                  {slices.map((slice, index) => {
                    if (!slice.count || !total) return null;
                    const before = slices.slice(0, index).reduce((sum, entry) => sum + entry.count, 0);
                    return <circle key={slice.id} cx="60" cy="60" r="46" fill="none" stroke={colors[index % colors.length]} strokeWidth="18" pathLength="100" strokeDasharray={`${slice.count / total * 100} 100`} strokeDashoffset={-before / total * 100} transform="rotate(-90 60 60)" />;
                  })}
                </svg>
                <div className="statistics-chart-total"><strong>{formatNumber(total)}</strong><span>jawapan</span></div>
              </div>
              <figcaption>
                {total === 0 ? "Belum ada jawapan untuk carta ini." : question ? "Berdasarkan jawapan yang diterima untuk dilema ini." : "Berdasarkan semua jawapan yang diterima, bukan bilangan peserta."}
              </figcaption>
            </figure>

            <ul className={`statistics-legend${question ? " statistics-legend-choices" : ""}`} aria-label="Butiran carta">
              {slices.map((slice, index) => (
                <li key={slice.id}>
                  <span className="statistics-swatch" style={{ backgroundColor: colors[index % colors.length] }} aria-hidden="true">{question ? String.fromCharCode(65 + index) : ""}</span>
                  <div><span className="statistics-legend-label">{slice.label}</span><small>{formatNumber(slice.count)} jawapan</small></div>
                  <strong>{slice.count > 0 && percentages[index] === 0 ? "<0.1" : formatNumber(percentages[index])}%</strong>
                </li>
              ))}
            </ul>
          </div>

          <p className="statistics-note">Pilihan yang terkumpul; bukan penilaian peribadi.</p>
          <footer className="statistics-actions">
            <button type="button" onClick={refresh} disabled={loading}><RefreshCw size={16} aria-hidden="true" /><span>{loading ? "Mengemas kini…" : "Muat semula"}</span></button>
            <a href="/api/statistics?format=csv" download><Download size={16} aria-hidden="true" /><span>Muat turun CSV</span></a>
          </footer>
          <p className="statistics-live" role="status">{loading ? "Statistik sedang dikemas kini." : ""}</p>
        </>
      )}
    </section>
  );
}
