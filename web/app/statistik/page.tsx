import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import StatisticsDashboard from "@/features/statistics/StatisticsDashboard";

export const metadata: Metadata = {
  title: "Pilihan komuniti · Peluang Kedua",
  description: "Lihat pilihan komuniti Taman Harmoni dalam carta statistik tanpa nama.",
};

export default function StatisticsPage() {
  return (
    <main className="statistics-page">
      <div className="statistics-page-inner">
        <a href="/" className="statistics-back"><ArrowLeft size={18} aria-hidden="true" />Kembali ke kumpulan</a>
        <StatisticsDashboard />
      </div>
    </main>
  );
}
