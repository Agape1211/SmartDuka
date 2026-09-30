import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/MarketingLayout";
import { StockCalculator } from "@/components/ShopCalculator";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata("Stock Reorder Calculator for Small Shops", "Estimate when to reorder shop stock using average daily sales, supplier lead time, safety stock, and current inventory.", "/tools/stock-calculator");

export default function StockCalculatorPage() {
  return <MarketingPage eyebrow="Free shop tool" title="Plan a stock reorder point" intro="Estimate how much stock you may need while waiting for a supplier delivery, then compare that target with what is currently on hand."><div className="space-y-8"><StockCalculator /><p className="leading-7 text-slate-600">DukaSmart lets you set low-stock thresholds on products and review items that need attention. <Link href="/features/inventory-management" className="font-semibold text-brand-dark underline">Explore inventory management</Link>.</p></div></MarketingPage>;
}