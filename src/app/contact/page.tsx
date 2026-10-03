import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/MarketingLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Contact DukaSmart support",
  "Get help setting up DukaSmart for your shop with the local-first system onboarding flow.",
  "/contact",
);

export default function ContactPage() {
  return (
    <MarketingPage
      eyebrow="Contact us"
      title="We are here to help."
      intro="Have a question about DukaSmart or need help setting up your shop? Reach out through your onboarding or support flow, and we will guide you through setup and usage."
    >
      <div className="rounded-2xl border border-teal-100 bg-white p-7 shadow-lg shadow-teal-950/5 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-dark">Support</p>
        <h2 className="mt-3 text-2xl font-bold text-slate-950">Local onboarding and setup support</h2>
        <p className="mt-3 max-w-xl leading-7 text-slate-600">
          The first version is designed for local setup and practical onboarding. We support the product through implementation guidance, training, and the operational workflow rather than paid messaging or automation integrations.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/about" className="inline-flex items-center rounded-xl bg-brand px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Review the blueprint</Link>
          <Link href="/features" className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-brand hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Explore features</Link>
        </div>
      </div>
    </MarketingPage>
  );
}
