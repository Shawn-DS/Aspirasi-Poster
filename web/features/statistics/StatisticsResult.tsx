"use client";
import { useEffect, useRef, useState } from "react";
import { ChartPie, X } from "lucide-react";
import type { StatisticsSyncState } from "./client";
import StatisticsDashboard from "./StatisticsDashboard";
import "./statistics-result.css";

export default function StatisticsResult({ state, retry }: {
  state: StatisticsSyncState;
  retry: () => void;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  const syncNote = <div className="statistics-sync" role="status">
    {state.error ? <><span>Statistik anda belum dihantar.</span><button type="button" onClick={retry}>Cuba lagi</button></> :
      state.pending > 0 ? <span>Menghantar statistik…</span> : null}
  </div>;
  return <section className="statistics-result" aria-label="Statistik komuniti">
    <button className="statistics-open" type="button" onClick={() => setOpen(true)}><ChartPie size={20} />Lihat statistik komuniti</button>
    {syncNote}
    <dialog className="statistics-dialog" ref={dialog} aria-label="Statistik komuniti"
      onClose={() => setOpen(false)} onCancel={() => setOpen(false)}
      onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="statistics-dialog-close"><button type="button" aria-label="Tutup statistik" onClick={() => setOpen(false)}><X size={22} /></button></div>
      {open && <><StatisticsDashboard refreshKey={state.revision} />{syncNote}<a className="statistics-public-link" href="/statistik" target="_blank" rel="noopener noreferrer">Buka halaman statistik ↗</a></>}
    </dialog>
  </section>;
}
