import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import StatisticsDashboard from "@/features/statistics/StatisticsDashboard";

export const metadata: Metadata = {
  title: "Statistik Peserta · Peluang Kedua",
  description: "Lihat perubahan peratusan temu duga (Fasa 1–3) dan susunan keutamaan nilai peserta tanpa identiti.",
};

export default function StatisticsPage() {
  return (
    <main className="statistics-page">
      <div className="statistics-page-inner">
        <a href="/" className="statistics-back"><ArrowLeft size={18} aria-hidden="true" />Kembali ke simulasi</a>
        <StatisticsDashboard />
      </div>
    </main>
  );
}
