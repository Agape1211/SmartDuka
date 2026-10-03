import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/MarketingLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "SME Operations Software for Tanzanian Shops",
  "Learn how DukaSmart helps Tanzanian retailers and small businesses manage sales, stock, purchases, daily reporting, and operations from one simple system.",
  "/about",
);

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="About DukaSmart"
      title="Better visibility for every shop and SME operation."
      intro="DukaSmart is a practical SME operations workspace for Tanzanian shop owners and their teams. It brings sales, inventory, purchasing, credit, and daily reporting into one simple place."
    >
      <div className="space-y-10 text-slate-700">
        <section>
          <h2 className="text-2xl font-bold text-slate-950">Our purpose</h2>
          <p className="mt-3 leading-8">Running a shop should not mean guessing what sold, what is running out, or where money is tied up. DukaSmart helps Tanzanian businesses move from scattered notebooks and WhatsApp messages into a clearer, more controlled operating system.</p>
        </section>
        <section className="grid gap-5 sm:grid-cols-3">
          {[
            ["Simple at the counter", "Record a sale quickly from a phone, tablet, or desktop without slowing down your team."],
            ["Useful every day", "See low-stock alerts, sales performance, and outstanding credit when you need them most."],
            ["Built for your team", "Owners can manage the business while employees handle transactions, restocking, and routine sales tasks."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6">{text}</p>
            </article>
          ))}
        </section>
        <section className="rounded-2xl bg-brand-dark px-6 py-8 text-white sm:px-8">
          <h2 className="text-2xl font-bold">Ready to make daily operations clearer?</h2>
          <p className="mt-2 text-teal-50">Create your shop account and start with the essentials for sales, stock, and reporting.</p>
          <Link href="/signup" className="mt-5 inline-block rounded-lg bg-white px-4 py-2.5 font-semibold text-brand-dark">Create an account</Link>
        </section>
      </div>
    </MarketingPage>
  );
}
