import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/MarketingLayout";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return <MarketingPage eyebrow="About DukaSmart" title="Better visibility for every shop." intro="DukaSmart is a simple sales and inventory workspace designed for Tanzanian shop owners and their teams."><div className="space-y-10 text-slate-700"><section><h2 className="text-2xl font-bold text-slate-950">Our purpose</h2><p className="mt-3 leading-8">Running a shop should not mean guessing what sold, what is running out, or where money is tied up. DukaSmart brings sales, stock, purchases, and useful business reporting into one clear place.</p></section><section className="grid gap-5 sm:grid-cols-3">{[["Simple at the counter", "Record a sale quickly from a phone, tablet, or desktop."], ["Useful every day", "See low-stock alerts, sales performance, and outstanding credit when you need them."], ["Built for your team", "Owners can manage the business while employees focus on sales and restocking."]].map(([title, text]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6">{text}</p></article>)}</section><section className="rounded-2xl bg-brand-dark px-6 py-8 text-white sm:px-8"><h2 className="text-2xl font-bold">Ready to get a clearer view of your shop?</h2><p className="mt-2 text-teal-50">Create your shop account and start with the essentials.</p><Link href="/signup" className="mt-5 inline-block rounded-lg bg-white px-4 py-2.5 font-semibold text-brand-dark">Create an account</Link></section></div></MarketingPage>;
}
