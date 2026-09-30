import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/MarketingLayout";
import { ProfitCalculator } from "@/components/ShopCalculator";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata("Small Shop Profit Calculator", "Estimate gross profit and margin from retail sales revenue and cost of goods sold. Free profit calculator for small shops.", "/tools/profit-calculator");

export default function ProfitCalculatorPage() {
  return <MarketingPage eyebrow="Free shop tool" title="Estimate gross profit from your sales" intro="Enter sales revenue and the cost of the products sold to calculate estimated gross profit and gross margin."><div className="space-y-8"><ProfitCalculator /><p className="leading-7 text-slate-600">For a fuller view of shop performance, DukaSmart connects recorded product costs to sales and includes estimated product profit in owner reports. <Link href="/features/business-reports" className="font-semibold text-brand-dark underline">Explore business reports</Link>.</p></div></MarketingPage>;
}