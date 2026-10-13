"use client";

import { useEffect, useState } from "react";
import { formatTZS } from "@/lib/money";
import { useLanguage } from "@/components/LanguageProvider";

type Payment = {
  id: string;
  amount: string;
  createdAt: string;
  recordedBy: string;
};

type Debt = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  total: string;
  amount_paid: string;
  outstanding: string;
  payments: Payment[];
};

async function readApiResponse(response: Response, fallback: string) {
  const text = await response.text();
  let data: { error?: string; debts?: Debt[]; outstanding?: number } = {};
  try {
    data = text ? JSON.parse(text) as typeof data : {};
  } catch {
    throw new Error(`${fallback} (server returned ${response.status} without valid JSON)`);
  }
  if (!response.ok) throw new Error(data.error ?? `${fallback} (HTTP ${response.status})`);
  return data;
}

export default function DebtsPage() {
  const { locale, t } = useLanguage();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [outstanding, setOutstanding] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  async function loadDebts() {
    const response = await fetch("/api/debts");
    const data = await readApiResponse(response, "Could not load debts");
    setDebts(data.debts ?? []);
    setOutstanding(Number(data.outstanding ?? 0));
  }

  useEffect(() => {
    let active = true;
    fetch("/api/debts")
      .then(async (response) => {
        const data = await readApiResponse(response, "Could not load debts");
        if (active) {
          setDebts(data.debts ?? []);
          setOutstanding(Number(data.outstanding ?? 0));
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load debts");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function recordPayment(debt: Debt, amount: number) {
    setSubmittingId(debt.id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/debts/${debt.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      await readApiResponse(response, "Could not record payment");
      setNotice(`${t("Payment recorded")} · TZS ${formatTZS(amount)} · ${debt.customer_name || t("customer")}.`);
      await loadDebts();
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Could not record payment");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Customer debts</h1>
          <p className="text-sm text-slate-500 mt-1">Record payments and review each remaining balance.</p>
        </div>
        <div className="border-l-4 border-amber-500 pl-3 py-1">
          <p className="text-xs text-slate-500">{t("Total outstanding")}</p>
          <p className="text-lg font-bold text-slate-800">TZS {formatTZS(outstanding)}</p>
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3 font-medium">{t("Customer / sale")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("Sale total")}</th>
              <th className="px-4 py-3 font-medium text-right">Paid</th>
              <th className="px-4 py-3 font-medium text-right">Remaining</th>
              <th className="px-4 py-3 font-medium">{t("Payment history")}</th>
              <th className="px-4 py-3 font-medium">{t("Record payment")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">{t("Loading debts...")}</td></tr>
            )}
            {!loading && debts.length === 0 && !error && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">{t("No outstanding customer debts.")}</td></tr>
            )}
            {debts.map((debt) => {
              const remaining = Number(debt.outstanding);
              const halfPayment = Math.round(remaining * 50) / 100;
              const busy = submittingId === debt.id;
              return (
                <tr key={debt.id} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="px-4 py-3 min-w-40">
                    <p className="font-medium text-slate-800">{debt.customer_name || t("Walk-in customer")}</p>
                    {debt.customer_phone && <p className="text-xs text-slate-500">{debt.customer_phone}</p>}
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(debt.created_at).toLocaleDateString(locale === "sw" ? "sw-TZ" : "en-TZ", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-slate-600">{formatTZS(debt.total)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-slate-600">{formatTZS(debt.amount_paid)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap font-semibold text-amber-700">{formatTZS(debt.outstanding)}</td>
                  <td className="px-4 py-3 min-w-44">
                    {debt.payments.length === 0 ? (
                      <span className="text-xs text-slate-400">{t("No payments yet")}</span>
                    ) : (
                      <details>
                        <summary className="cursor-pointer text-xs font-medium text-brand">
                          {debt.payments.length} {t(debt.payments.length === 1 ? "payment" : "payments")}
                        </summary>
                        <ul className="mt-2 space-y-1 text-xs text-slate-500">
                          {debt.payments.map((payment) => (
                            <li key={payment.id}>
                              {formatTZS(payment.amount)} · {payment.recordedBy} · {new Date(payment.createdAt).toLocaleDateString(locale === "sw" ? "sw-TZ" : "en-TZ")}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </td>
                  <td className="px-4 py-3 min-w-40">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        disabled={busy || halfPayment <= 0}
                        onClick={() => recordPayment(debt, halfPayment)}
                        className="rounded-md border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {t("Pay half")} · {formatTZS(halfPayment)}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => recordPayment(debt, remaining)}
                        className="rounded-md bg-brand px-2 py-1.5 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                      >
                        {t("Pay in full")} · {formatTZS(remaining)}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}