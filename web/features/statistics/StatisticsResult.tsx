"use client";
import type { StatisticsSyncState } from "./client";
import StatisticsDashboard from "./StatisticsDashboard";
import "./statistics-result.css";

export default function StatisticsResult({ state, retry }: {
  state: StatisticsSyncState;
  retry: () => void;
}) {
  return (
    <section className="statistics-result" aria-label="Peratusan pilihan peserta">
      {state.error ? (
        <div className="statistics-sync is-error" role="status">
          <span>Statistik anda belum dihantar.</span>
          <button type="button" onClick={retry}>Cuba lagi</button>
        </div>
      ) : state.pending > 0 ? (
        <div className="statistics-sync" role="status">
          <span>Menghantar pilihan anda…</span>
        </div>
      ) : null}
      <StatisticsDashboard refreshKey={state.revision} compact />
    </section>
  );
}
