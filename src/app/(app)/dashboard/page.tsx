"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatTZS } from "@/lib/money";
import { LocalizedContent, useLanguage } from "@/components/LanguageProvider";

type Summary = {
  today: { total: string; count: number };
  month: { total: string; count: number };
  monthProfit: string;
  topProducts: { id: string; name: string; units_sold: string; revenue: string }[];
  lowStock: { id: string; name: string; stock: number; low_stock_at: number }[];
  productCount: number;
};

type ChartPoint = { day: string; total: string };

export default function DashboardPage() {
  const { locale } = useLanguage();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setName(d.user?.name ?? ""));
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then(setSummary);
    fetch("/api/dashboard/chart?days=14")
      .then((r) => r.json())
      .then((d) => setChart(d.points ?? []));
  }, []);

  const chartData = chart.map((p) => ({
    day: new Date(p.day).toLocaleDateString(locale === "sw" ? "sw-TZ" : "en-TZ", { day: "2-digit", month: "short" }),
    total: parseFloat(p.total),
  }));

  return (
    <LocalizedContent>
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800">Karibu, {name || "…"} 👋</h1>
      <p className="text-sm text-slate-500 mt-1">Here&apos;s how the shop is doing.</p>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Today's sales" value={summary ? `TZS ${formatTZS(summary.today.total)}` : "—"} sub={summary ? `${summary.today.count} sale${summary.today.count === 1 ? "" : "s"}` : ""} />
        <Card label="This month" value={summary ? `TZS ${formatTZS(summary.month.total)}` : "—"} sub={summary ? `${summary.month.count} sale${summary.month.count === 1 ? "" : "s"}` : ""} />
        <Card label="Est. profit (month)" value={summary ? `TZS ${formatTZS(summary.monthProfit)}` : "—"} accent="text-emerald-600" />
        <Card
          label="Low stock items"
          value={summary ? String(summary.lowStock.length) : "—"}
          accent={summary && summary.lowStock.length > 0 ? "text-amber-600" : undefined}
        />
      </div>

      {/* Chart */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Sales — last 14 days</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(v) => formatTZS(v)}
                width={60}
              />
              <Tooltip formatter={(v) => [`TZS ${formatTZS(Number(v) || 0)}`, locale === "sw" ? "Mauzo" : "Sales"]} />
              <Bar dataKey="total" fill="#0f766e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Top-selling products (this month)
          </h2>
          {summary && summary.topProducts.length === 0 && (
            <p className="text-sm text-slate-400 py-4 text-center">No sales yet this month.</p>
          )}
          <div className="space-y-2">
            {summary?.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">
                  <span className="text-slate-400 mr-2">{i + 1}.</span>
                  {p.name}
                </span>
                <span className="text-slate-500">{p.units_sold} sold</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Low-stock alerts</h2>
          {summary && summary.lowStock.length === 0 && (
            <p className="text-sm text-slate-400 py-4 text-center">
              All products are above their low-stock threshold. 🎉
            </p>
          )}
          <div className="space-y-2">
            {summary?.lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{p.name}</span>
                <span className="text-amber-600 font-medium">
                  {p.stock} left (alert at {p.low_stock_at})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </LocalizedContent>
  );
}

function Card({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-bold mt-1 ${accent ?? "text-slate-800"}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
