import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/MarketingLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "About DukaSmart | SME Digital Operations in Tanzania",
  "DukaSmart helps Tanzanian SMEs digitize and improve operations through implementation, automation, analytics, practical software, and ongoing support.",
  "/about",
);

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="About DukaSmart"
      title="Better operations, built around how your business works."
      intro="DukaSmart helps Tanzanian small and medium-sized businesses replace disconnected manual work with practical digital workflows, implementation, automation, analytics, and ongoing technology support."
    >
      <div className="space-y-10 text-slate-700">
        <section>
          <h2 className="text-2xl font-bold text-slate-950">The problem we solve</h2>
          <p className="mt-3 leading-8">Many businesses manage orders, stock, expenses, and customer details across notebooks, spreadsheets, calls, and WhatsApp. We help connect the work that matters, make records easier to trust, and give owners a clearer view of daily operations.</p>
        </section>
        <section className="grid gap-5 sm:grid-cols-3">
          {[
            ["Problem first", "We map the real workflow before recommending software, configuration, or automation."],
            ["Use what already works", "We can build around suitable existing tools instead of forcing every business into a new generic system."],
            ["Improve with evidence", "We pilot with users, document repeatable processes, and develop software only when a shared need is clear."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6">{text}</p>
            </article>
          ))}
        </section>
        <section className="rounded-2xl bg-brand-dark px-6 py-8 text-white sm:px-8">
          <h2 className="text-2xl font-bold">Service first. Reusable software next.</h2>
          <p className="mt-2 text-teal-50">We deliver implementation and support, learn from repeated customer problems, and turn proven workflows into reusable tools where that creates lasting value.</p>
          <div className="mt-5 flex flex-wrap gap-3"><Link href="/services" className="inline-block rounded-lg bg-white px-4 py-2.5 font-semibold text-brand-dark">Explore services</Link><Link href="/contact" className="inline-block rounded-lg border border-white/40 px-4 py-2.5 font-semibold text-white">Discuss a workflow</Link></div>
        </section>
      </div>
    </MarketingPage>
  );
}
