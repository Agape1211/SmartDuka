"use client";

import { useState } from "react";
import { LocalizedContent, useLanguage } from "@/components/LanguageProvider";

export function ProfitCalculator() {
  const { locale } = useLanguage();
  const money = new Intl.NumberFormat(locale === "sw" ? "sw-TZ" : "en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 });
  const [sales, setSales] = useState(0);
  const [cost, setCost] = useState(0);
  const grossProfit = sales - cost;
  const margin = sales > 0 ? (grossProfit / sales) * 100 : 0;

  return (
    <LocalizedContent><CalculatorFrame title="Duka profit calculator" intro="Estimate gross profit from sales and the cost of the goods sold. This estimate excludes rent, wages, taxes, and other operating expenses.">
      <NumberField id="sales-revenue" label="Sales revenue (TZS)" value={sales} onChange={setSales} />
      <NumberField id="goods-cost" label="Cost of goods sold (TZS)" value={cost} onChange={setCost} />
      <div aria-live="polite" className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
        <Result label="Estimated gross profit" value={money.format(grossProfit)} />
        <Result label="Gross margin" value={`${margin.toFixed(1)}%`} />
      </div>
      <p className="text-sm leading-6 text-slate-500">Formula: (sales revenue − cost of goods sold) ÷ sales revenue. A negative result means the entered product costs exceed sales.</p>
    </CalculatorFrame></LocalizedContent>
  );
}

export function StockCalculator() {
  const [dailySales, setDailySales] = useState(0);
  const [leadTime, setLeadTime] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [onHand, setOnHand] = useState(0);
  const reorderPoint = Math.ceil(dailySales * leadTime + buffer);
  const suggestedOrder = Math.max(0, reorderPoint - onHand);

  return (
    <LocalizedContent><CalculatorFrame title="Stock reorder calculator" intro="Estimate a reorder point from average daily sales, supplier lead time, and a safety buffer. Use it as a planning aid and adjust for real demand and deliveries.">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="daily-sales" label="Average units sold per day" value={dailySales} onChange={setDailySales} />
        <NumberField id="lead-time" label="Supplier lead time (days)" value={leadTime} onChange={setLeadTime} />
        <NumberField id="safety-stock" label="Safety stock (units)" value={buffer} onChange={setBuffer} />
        <NumberField id="stock-on-hand" label="Current stock on hand" value={onHand} onChange={setOnHand} />
      </div>
      <div aria-live="polite" className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
        <Result label="Suggested reorder point" value={`${reorderPoint} units`} />
        <Result label="Suggested order quantity" value={`${suggestedOrder} units`} />
      </div>
      <p className="text-sm leading-6 text-slate-500">Formula: (average daily sales × lead-time days) + safety stock. The order quantity is the amount needed to reach that point from your current stock.</p>
    </CalculatorFrame></LocalizedContent>
  );
}

function CalculatorFrame({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return <section className="space-y-6 rounded-lg border border-slate-200 bg-white p-5 sm:p-7"><h2 className="text-xl font-bold text-slate-950">{title}</h2><p className="-mt-4 leading-7 text-slate-600">{intro}</p>{children}</section>;
}

function NumberField({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (value: number) => void }) {
  return <label htmlFor={id} className="block text-sm font-semibold text-slate-700">{label}<input id={id} type="number" min="0" step="any" value={value} onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))} className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" /></label>;
}

function Result({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-teal-50 p-4"><p className="text-sm font-medium text-teal-900">{label}</p><p className="mt-1 text-2xl font-bold text-brand-dark">{value}</p></div>;
}