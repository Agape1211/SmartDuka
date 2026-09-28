"use client";

import { useEffect, useState, useMemo } from "react";
import { formatTZS } from "@/lib/money";

type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  sell_price: string;
  stock: number;
};

type CartLine = { productId: string; name: string; unit: string; price: number; qty: number; stock: number };

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "CREDIT">("PAID");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  function addToCart(p: Product) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        if (existing.qty >= p.stock) return prev;
        return prev.map((l) =>
          l.productId === p.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      if (p.stock <= 0) return prev;
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          unit: p.unit,
          price: parseFloat(p.sell_price),
          qty: 1,
          stock: p.stock,
        },
      ];
    });
  }

  function updateQty(productId: string, qty: number) {
    setCart((prev) =>
      prev
        .map((l) =>
          l.productId === productId
            ? { ...l, qty: Math.max(1, Math.min(qty, l.stock)) }
            : l
        )
        .filter((l) => l.qty > 0)
    );
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }

  const total = useMemo(
    () => cart.reduce((sum, l) => sum + l.price * l.qty, 0),
    [cart]
  );

  async function handleSubmit() {
    if (cart.length === 0) {
      setError("Add at least one product to the sale.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentStatus,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        items: cart.map((l) => ({ productId: l.productId, quantity: l.qty })),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not record sale");
      setSubmitting(false);
      return;
    }

    setSuccess(`Sale recorded — total TZS ${formatTZS(total)}`);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setPaymentStatus("PAID");
    setSubmitting(false);
    // refresh product list so stock reflects the sale
    setSearch((s) => s);
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Record a sale</h1>
      <p className="text-sm text-slate-500 mb-6">
        Pick products, set quantity, choose payment status.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Product picker */}
        <div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products to add..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-3"
          />
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            {products.length === 0 && (
              <p className="px-4 py-6 text-center text-slate-400 text-sm">
                No products match.
              </p>
            )}
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-400">
                    {formatTZS(p.sell_price)} / {p.unit} · {p.stock} in stock
                  </p>
                </div>
                <span className="text-brand text-sm font-medium">+ Add</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Cart</h2>
            {cart.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">
                No items yet — add products from the left.
              </p>
            )}
            <div className="space-y-3">
              {cart.map((l) => (
                <div key={l.productId} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{l.name}</p>
                    <p className="text-xs text-slate-400">{formatTZS(l.price)} / {l.unit}</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={l.stock}
                    value={l.qty}
                    onChange={(e) => updateQty(l.productId, parseInt(e.target.value, 10) || 1)}
                    className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm text-center"
                  />
                  <p className="w-24 text-right text-sm font-medium text-slate-700">
                    {formatTZS(l.price * l.qty)}
                  </p>
                  <button
                    onClick={() => removeLine(l.productId)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between text-sm font-bold text-slate-800">
                <span>Total</span>
                <span>TZS {formatTZS(total)}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Payment status
              </label>
              <div className="flex gap-2">
                {(["PAID", "CREDIT"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setPaymentStatus(s)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium border ${
                      paymentStatus === s
                        ? "bg-brand text-white border-brand"
                        : "border-slate-300 text-slate-600"
                    }`}
                  >
                    {s === "PAID" ? "Paid" : "On credit"}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Customer name (optional)
                </label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Phone (optional)
                </label>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
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
              disabled={submitting || cart.length === 0}
              className="w-full bg-brand hover:bg-brand-dark text-white font-medium rounded-lg py-2.5 text-sm disabled:opacity-60"
            >
              {submitting ? "Recording..." : `Record sale — TZS ${formatTZS(total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
