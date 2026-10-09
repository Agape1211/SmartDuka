import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/MarketingLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Contact DukaSmart | Digital Operations Support",
  "Talk with DukaSmart about SME operations, digital implementation, workflow automation, analytics, or DukaSmart software onboarding.",
  "/contact",
);

export default function ContactPage() {
  return (
    <MarketingPage
      eyebrow="Contact us"
      title="Tell us where work gets stuck."
      intro="Share the operational task you want to improve, whether it is managing sales and stock, handling orders, connecting tools, or getting a clearer business view. We will start with the workflow and discuss a practical next step."
    >
      <div className="rounded-2xl border border-teal-100 bg-white p-7 shadow-lg shadow-teal-950/5 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-dark">Start a conversation</p>
        <h2 className="mt-3 text-2xl font-bold text-slate-950">Business systems and DukaSmart support</h2>
        <p className="mt-3 max-w-xl leading-7 text-slate-600">
          Tell us about your business, the steps your team follows today, and the result you need. We can discuss digital presence, system implementation, workflow automation, reporting, or onboarding for the live DukaSmart sales and inventory platform.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="https://wa.me/255616234063" target="_blank" rel="noreferrer" className="inline-flex items-center rounded-xl bg-brand px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Message us on WhatsApp</a>
          <Link href="/services" className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-brand hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Explore services</Link>
        </div>
      </div>
    </MarketingPage>
  );
}
