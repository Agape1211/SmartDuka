import type { Metadata } from "next";
import { MarketingPage } from "@/components/MarketingLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Contact DukaSmart support",
  "Get help setting up DukaSmart for your shop. Contact the Tanzania-based support team directly on WhatsApp.",
  "/contact",
);
const whatsappUrl = "https://wa.me/255616234063";

export default function ContactPage() {
  return <MarketingPage eyebrow="Contact us" title="We are here to help." intro="Have a question about DukaSmart or need help setting up your shop? Send us a message on WhatsApp."><div className="rounded-2xl border border-teal-100 bg-white p-7 shadow-lg shadow-teal-950/5 sm:p-10"><p className="text-sm font-semibold uppercase tracking-wide text-brand-dark">WhatsApp support</p><p className="mt-3 text-2xl font-bold text-slate-950">+255 616 234 063</p><p className="mt-3 max-w-xl leading-7 text-slate-600">Tap the button below to open a direct WhatsApp conversation with the DukaSmart team.</p><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#1da851] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2">Message us on WhatsApp <span aria-hidden="true">↗</span></a></div></MarketingPage>;
}
