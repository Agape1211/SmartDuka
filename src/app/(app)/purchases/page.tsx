"use client";

import { useEffect, useState, useMemo } from "react";
import { formatTZS } from "@/lib/money";
import { LocalizedContent, useLanguage } from "@/components/LanguageProvider";

type Product = { id: string; name: string; unit: string; cost_price: string; stock: number };
type PurchaseLine = { productId: string; name: string; unit: string; unitCost: string; qty: string };
type PurchaseHistory = {
  id: string;
  supplier: string | null;
  total: string;
  created_at: string;
  received_by_name: string;
  items: { productName: string; quantity: number; unitCost: string }[];
};

export default function PurchasesPage() {
  const { locale } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<PurchaseLine[]>([]);
  const [supplier, setSupplier] = useState("");
  const [history, setHistory] = useState<PurchaseHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadHistory() {
    const res = await fetch("/api/purchases?limit=20");
    const data = await res.json();
    setHistory(data.purchases ?? []);
  }

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadHistory();
    }, 0);
    return () => window.clearTimeout(task);
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products ?? []);
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  function addLine(p: Product) {
    setLines((prev) => {
      if (prev.some((l) => l.productId === p.id)) return prev;
      return [
        ...prev,
        { productId: p.id, name: p.name, unit: p.unit, unitCost: p.cost_price, qty: "1" },
      ];
    });
  }

  function updateLine(productId: string, field: "qty" | "unitCost", value: string) {
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, [field]: value } : l))
    );
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  const total = useMemo(
    () =>
      lines.reduce(
        (sum, l) => sum + (parseFloat(l.unitCost) || 0) * (parseInt(l.qty, 10) || 0),
        0
      ),
    [lines]
  );

  async function handleSubmit() {
    if (lines.length === 0) {
      setError("Add at least one product.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplier: supplier || null,
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: parseInt(l.qty, 10) || 0,
          unitCost: parseFloat(l.unitCost) || 0,
        })),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not record purchase");
      setSubmitting(false);
      return;
    }

    setSuccess(`Restock recorded — total TZS ${formatTZS(total)}`);
    setLines([]);
    setSupplier("");
    setSubmitting(false);
    loadHistory();
    setSearch((s) => s);
  }

  return (
    <LocalizedContent>
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Purchases / restocking</h1>
      <p className="text-sm text-slate-500 mb-6">
        Record stock received from suppliers — updates stock and cost price.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products to restock..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-3"
          />
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            {products.length === 0 && (
              <p className="px-4 py-6 text-center text-slate-400 text-sm">No products match.</p>
            )}
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => addLine(p)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-400">
                    Current cost {formatTZS(p.cost_price)} · {p.stock} in stock
                  </p>
                </div>
                <span className="text-brand text-sm font-medium">+ Add</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Restock list</h2>
            {lines.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">
                No items yet — add products from the left.
              </p>
            )}
            <div className="space-y-3">
              {lines.map((l) => (
                <div key={l.productId} className="flex items-center gap-2">
                  <p className="flex-1 text-sm font-medium text-slate-800 truncate">{l.name}</p>
                  <input
                    type="number"
                    min={1}
                    value={l.qty}
                    onChange={(e) => updateLine(l.productId, "qty", e.target.value)}
                    className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm text-center"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={l.unitCost}
                    onChange={(e) => updateLine(l.productId, "unitCost", e.target.value)}
                    className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm text-right"
                    placeholder="Unit cost"
                  />
                  <button
                    onClick={() => removeLine(l.productId)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {lines.length > 0 && (
              <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between text-sm font-bold text-slate-800">
                <span>Total cost</span>
                <span>TZS {formatTZS(total)}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Supplier (optional)
              </label>
              <input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            {success && (
              <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                {success}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || lines.length === 0}
              className="w-full bg-brand hover:bg-brand-dark text-white font-medium rounded-lg py-2.5 text-sm disabled:opacity-60"
            >
              {submitting ? "Recording..." : `Record restock — TZS ${formatTZS(total)}`}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent purchases</h2>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {history.length === 0 && (
            <p className="px-4 py-6 text-center text-slate-400 text-sm">No purchases yet.</p>
          )}
          {history.map((h) => (
            <div key={h.id} className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  {h.supplier || "Unnamed supplier"}{" "}
                  <span className="text-slate-400 font-normal">
                    · {new Date(h.created_at).toLocaleString(locale === "sw" ? "sw-TZ" : "en-TZ")}
                  </span>
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {h.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                TZS {formatTZS(h.total)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </LocalizedContent>
  );
}
