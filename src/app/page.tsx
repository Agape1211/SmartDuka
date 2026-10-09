import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { MarketingFooter } from "@/components/MarketingLayout";
import { BrandAvatar } from "@/components/BrandAvatar";
import { LanguageSwitcher, LocalizedContent } from "@/components/LanguageProvider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "DukaSmart | SME Operations and Shop Management in Tanzania" },
  description: "DukaSmart helps Tanzanian shops and SMEs manage sales, stock, and purchases, with practical digital implementation, reporting, automation, and ongoing support.",
  alternates: { canonical: "/" },
};

const organizationUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dukasmart.online";
const websiteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${organizationUrl}/#organization`,
      name: "DukaSmart",
      url: organizationUrl,
      logo: {
        "@type": "ImageObject",
        url: new URL("/dukasmart.png", organizationUrl).toString(),
      },
      description: "Digital operations implementation, workflow automation, analytics, and practical software for Tanzanian SMEs.",
      areaServed: { "@type": "Country", name: "Tanzania" },
      knowsLanguage: ["en-TZ", "sw-TZ"],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+255616234063",
        url: `${organizationUrl}/contact`,
        contactType: "customer support",
        availableLanguage: ["English", "Swahili"],
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "DukaSmart",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: organizationUrl,
      brand: { "@type": "Brand", name: "DukaSmart" },
      description: "Browser-based sales, inventory, purchase, credit, and owner reporting software for Tanzanian retail shops.",
      areaServed: { "@type": "Country", name: "Tanzania" },
      inLanguage: ["en-TZ", "sw-TZ"],
      publisher: { "@id": `${organizationUrl}/#organization` },
    },
    {
      "@type": "WebSite",
      "@id": `${organizationUrl}/#website`,
      name: "DukaSmart",
      url: organizationUrl,
      publisher: { "@id": `${organizationUrl}/#organization` },
      inLanguage: ["en-TZ", "sw-TZ"],
    },
  ],
};

const features = [
  ["Start with the workflow", "We learn how your team handles sales, stock, orders, and customer information before recommending tools."],
  ["Implement what fits", "Configure practical systems, connect existing tools, and help your team adopt the new process."],
  ["Improve with evidence", "Review what works in day-to-day use, support the operation, and standardize repeated solutions."],
];

export default async function Home() {
  // Keep the public landing page available if its optional session check
  // cannot reach Supabase or Postgres during an outage.
  let session = null;
  try {
    session = await getSession();
  } catch (error) {
    console.error("Unable to check session on landing page", error);
  }
  if (session) redirect(session.role === "OWNER" ? "/dashboard" : "/sales/new");

  return (
    <LocalizedContent>
    <main className="min-h-screen overflow-hidden bg-[#f7fbfa] text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }} />
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-brand-dark" aria-label="DukaSmart home">
          <BrandAvatar /><span>DukaSmart</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3"><LanguageSwitcher /><Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-dark">Sign in</Link><Link href="/signup" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Start free</Link></div>
      </header>
      <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28 lg:pt-24">
        <div className="max-w-2xl"><p className="mb-5 inline-flex rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-brand-dark">SME digital operations for Tanzania</p><h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">Make everyday business operations work better.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">We help Tanzanian SMEs move from scattered notebooks, spreadsheets, and messages to connected workflows through practical implementation, automation, analytics, and ongoing support.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/services" className="rounded-xl bg-brand px-6 py-3.5 text-center font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Explore our services</Link><Link href="/features" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center font-semibold text-slate-700 transition hover:border-brand hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">See DukaSmart software</Link></div><div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-600"><span className="rounded-full border border-slate-200 bg-white px-3 py-1">Digital presence</span><span className="rounded-full border border-slate-200 bg-white px-3 py-1">Sales and inventory</span><span className="rounded-full border border-slate-200 bg-white px-3 py-1">Workflow automation</span><span className="rounded-full border border-slate-200 bg-white px-3 py-1">Business reporting</span></div></div>
        <div className="relative mx-auto w-full max-w-lg rounded-3xl border border-teal-100 bg-white p-5 shadow-2xl shadow-teal-950/10 sm:p-7" aria-label="Example DukaSmart dashboard"><div className="flex items-center justify-between border-b border-slate-100 pb-5"><div><p className="font-bold text-slate-900">Mwanzo Hardware</p><p className="text-sm text-slate-500">Today&apos;s overview</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Live</span></div><div className="grid grid-cols-2 gap-3 py-5"><div className="rounded-2xl bg-teal-50 p-4"><p className="text-xs font-medium text-teal-800">Sales today</p><p className="mt-1 text-2xl font-bold text-brand-dark">TZS 428k</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-medium text-amber-800">Low stock</p><p className="mt-1 text-2xl font-bold text-amber-900">3 items</p></div></div><div className="space-y-3 rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between text-sm"><span className="font-medium">Cement 50kg</span><span className="font-semibold text-brand-dark">12 bags</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-3/4 rounded-full bg-brand" /></div><div className="flex items-center justify-between text-sm"><span className="font-medium">Roofing nails</span><span className="font-semibold text-amber-700">4 kg</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-1/4 rounded-full bg-amber-500" /></div></div></div>
      </section>
      <section className="border-y border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-3">{features.map(([title, description], index) => <article key={title} className="rounded-2xl border border-slate-100 p-6 shadow-sm"><span className="grid size-9 place-items-center rounded-lg bg-teal-50 font-bold text-brand-dark">0{index + 1}</span><h2 className="mt-5 text-lg font-bold">{title}</h2><p className="mt-2 leading-7 text-slate-600">{description}</p></article>)}</div></section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-3"><article><h2 className="text-xl font-bold text-slate-950">Digital operations services</h2><p className="mt-2 leading-7 text-slate-600">Web presence, workflow improvement, integrations, dashboards, and practical implementation support.</p><Link href="/services" className="mt-3 inline-block font-semibold text-brand-dark underline">Explore services</Link></article><article><h2 className="text-xl font-bold text-slate-950">DukaSmart today</h2><p className="mt-2 leading-7 text-slate-600">The live platform connects product records, sales, purchases, credit status, low-stock alerts, and owner reports.</p><Link href="/features" className="mt-3 inline-block font-semibold text-brand-dark underline">Explore current features</Link></article><article><h2 className="text-xl font-bold text-slate-950">For your kind of business</h2><p className="mt-2 leading-7 text-slate-600">We start with your actual process and adapt implementation to your sector, team, and existing tools.</p><Link href="/solutions" className="mt-3 inline-block font-semibold text-brand-dark underline">Browse shop workflows</Link></article></section>
      <section className="border-y border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1fr] md:items-center"><div><p className="text-sm font-bold uppercase tracking-wider text-brand-dark">Service first, software where it fits</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">No generic ERP pitch. Start with the problem.</h2><p className="mt-4 max-w-xl leading-7 text-slate-600">We assess the workflow, use existing tools where they make sense, and implement a focused solution. When the same unmet need appears across businesses, we can shape a reusable product around proven demand.</p></div><ol className="grid gap-4 sm:grid-cols-2">{[["01", "Discover the workflow"], ["02", "Prototype a practical fix"], ["03", "Pilot with real users"], ["04", "Standardize what works"]].map(([number, label]) => <li key={number} className="flex items-center gap-3 border-b border-slate-200 pb-3"><span className="font-mono text-sm font-bold text-brand-dark">{number}</span><span className="font-semibold text-slate-800">{label}</span></li>)}</ol></div></section>
      <section className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Make the next business improvement practical.</h2><p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">Tell us where work gets stuck. We can start with one workflow and build from evidence.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/contact" className="rounded-xl bg-brand px-6 py-3.5 font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Discuss your workflow</Link><Link href="/signup" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-brand hover:text-brand-dark">Try DukaSmart</Link></div></section>
      <MarketingFooter />
    </main>
    </LocalizedContent>
  );
}
