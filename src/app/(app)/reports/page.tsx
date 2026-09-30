"use client";

import { useEffect, useState } from "react";
import { formatTZS } from "@/lib/money";
import { LocalizedContent, useLanguage } from "@/components/LanguageProvider";

type ReportItem = { productName: string; quantity: number; unitPrice: string };
type ReportSale = {
  id: string;
  created_at: string;
  customer_name: string | null;
  payment_status: "PAID" | "CREDIT";
  recorded_by_name: string;
  total: string;
  items: ReportItem[];
};
type ReportData = {
  sales: ReportSale[];
  totals: { revenue: string; profit: string; saleCount: number; creditOutstanding: string };
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function monthStr() {
  return new Date().toISOString().slice(0, 7);
}

export default function ReportsPage() {
  const { locale } = useLanguage();
  const [mode, setMode] = useState<"daily" | "monthly">("daily");
  const [date, setDate] = useState(todayStr());
  const [month, setMonth] = useState(monthStr());
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const task = window.setTimeout(() => {
      setLoading(true);
      const params = mode === "daily" ? `date=${date}` : `month=${month}`;
      fetch(`/api/reports/${mode}?${params}`)
        .then((r) => r.json())
        .then((d) => {
          if (active) { setData(d); setLoading(false); }
        })
        .catch(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(task); };
  }, [mode, date, month]);

  function exportUrl(format: "csv" | "pdf") {
    const params =
      mode === "daily"
        ? `type=daily&date=${date}&format=${format}`
        : `type=monthly&month=${month}&format=${format}`;
    return `/api/reports/export?${params}&lang=${locale}`;
  }

  return (
    <LocalizedContent>
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Reports</h1>
      <p className="text-sm text-slate-500 mb-6">Daily and monthly sales, exportable as CSV or PDF.</p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex rounded-lg border border-slate-300 overflow-hidden">
          {(["daily", "monthly"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm font-medium ${
                mode === m ? "bg-brand text-white" : "bg-white text-slate-600"
              }`}
            >
              {m === "daily" ? "Daily" : "Monthly"}
            </button>
          ))}
        </div>

        {mode === "daily" ? (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        ) : (
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        )}

        <div className="flex-1" />

        <a
          href={exportUrl("csv")}
          className="text-sm font-medium rounded-lg border border-slate-300 px-4 py-2 text-slate-600 hover:bg-slate-50"
        >
          Export CSV
        </a>
        <a
          href={exportUrl("pdf")}
          className="text-sm font-medium rounded-lg bg-brand hover:bg-brand-dark text-white px-4 py-2"
        >
          Export PDF
        </a>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Sales" value={data ? String(data.totals.saleCount) : "—"} />
        <Stat label="Revenue" value={data ? `TZS ${formatTZS(data.totals.revenue)}` : "—"} />
        <Stat label="Est. profit" value={data ? `TZS ${formatTZS(data.totals.profit)}` : "—"} accent="text-emerald-600" />
        <Stat
          label="Outstanding credit"
          value={data ? `TZS ${formatTZS(data.totals.creditOutstanding)}` : "—"}
          accent={data && parseFloat(data.totals.creditOutstanding) > 0 ? "text-amber-600" : undefined}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && data && data.sales.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No sales recorded for this period.
                </td>
              </tr>
            )}
            {data?.sales.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {new Date(s.created_at).toLocaleString(locale === "sw" ? "sw-TZ" : "en-TZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })}
                </td>
                <td className="px-4 py-3 text-slate-600">{s.customer_name || "—"}</td>
                <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                  {s.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.payment_status === "PAID"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {s.payment_status === "PAID" ? "Paid" : "Credit"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-800">
                  {formatTZS(s.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </LocalizedContent>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-bold mt-1 ${accent ?? "text-slate-800"}`}>{value}</p>
    </div>
  );
}
