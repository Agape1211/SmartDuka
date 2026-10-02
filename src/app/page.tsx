import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { MarketingFooter } from "@/components/MarketingLayout";
import { BrandAvatar } from "@/components/BrandAvatar";
import { LanguageSwitcher, LocalizedContent } from "@/components/LanguageProvider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sales & Inventory Management Software for Tanzanian Shops",
  description: "Manage sales, stock, purchases and credit with DukaSmart, a simple business management platform built for small shops in Tanzania.",
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
      description: "Sales, stock, purchase, and reporting software for Tanzanian retail shops.",
      areaServed: { "@type": "Country", name: "Tanzania" },
      knowsLanguage: ["en-TZ", "sw-TZ"],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+255616234063",
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
  ["Record sales in seconds", "Create paid or credit sales from a simple, phone-friendly cart."],
  ["Never lose track of stock", "See quantities as they change and get a clear low-stock warning."],
  ["Know what is working", "Follow daily sales, profit estimates, top products, and outstanding credit."],
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
        <div className="max-w-2xl"><p className="mb-5 inline-flex rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-brand-dark">Built for growing Tanzanian shops</p><h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">Sales &amp; stock management for Tanzanian shops.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">DukaSmart is shop management software for Tanzanian retailers. Record sales, track stock and purchases, and follow business performance from your phone or computer.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/signup" className="rounded-xl bg-brand px-6 py-3.5 text-center font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Create your shop account</Link><Link href="/login" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center font-semibold text-slate-700 transition hover:border-brand hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">I already have an account</Link></div><p className="mt-4 text-sm text-slate-500">No card required. Your first owner account is ready in minutes.</p></div>
        <div className="relative mx-auto w-full max-w-lg rounded-3xl border border-teal-100 bg-white p-5 shadow-2xl shadow-teal-950/10 sm:p-7" aria-label="Example DukaSmart dashboard"><div className="flex items-center justify-between border-b border-slate-100 pb-5"><div><p className="font-bold text-slate-900">Mwanzo Hardware</p><p className="text-sm text-slate-500">Today&apos;s overview</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Live</span></div><div className="grid grid-cols-2 gap-3 py-5"><div className="rounded-2xl bg-teal-50 p-4"><p className="text-xs font-medium text-teal-800">Sales today</p><p className="mt-1 text-2xl font-bold text-brand-dark">TZS 428k</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-medium text-amber-800">Low stock</p><p className="mt-1 text-2xl font-bold text-amber-900">3 items</p></div></div><div className="space-y-3 rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between text-sm"><span className="font-medium">Cement 50kg</span><span className="font-semibold text-brand-dark">12 bags</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-3/4 rounded-full bg-brand" /></div><div className="flex items-center justify-between text-sm"><span className="font-medium">Roofing nails</span><span className="font-semibold text-amber-700">4 kg</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-1/4 rounded-full bg-amber-500" /></div></div></div>
      </section>
      <section className="border-y border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-3">{features.map(([title, description], index) => <article key={title} className="rounded-2xl border border-slate-100 p-6 shadow-sm"><span className="grid size-9 place-items-center rounded-lg bg-teal-50 font-bold text-brand-dark">0{index + 1}</span><h2 className="mt-5 text-lg font-bold">{title}</h2><p className="mt-2 leading-7 text-slate-600">{description}</p></article>)}</div></section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-3"><article><h2 className="text-xl font-bold text-slate-950">Shop workflows</h2><p className="mt-2 leading-7 text-slate-600">See how sales, inventory, purchases, credit, and reporting work together.</p><Link href="/features" className="mt-3 inline-block font-semibold text-brand-dark underline">Explore DukaSmart features</Link></article><article><h2 className="text-xl font-bold text-slate-950">For your kind of shop</h2><p className="mt-2 leading-7 text-slate-600">Explore practical workflows for hardware, electronics, cosmetics, and general retailers.</p><Link href="/solutions" className="mt-3 inline-block font-semibold text-brand-dark underline">Browse shop solutions</Link></article><article><h2 className="text-xl font-bold text-slate-950">Learn and plan</h2><p className="mt-2 leading-7 text-slate-600">Read practical guides or use free tools to estimate profit and reorder points.</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2"><Link href="/blog" className="font-semibold text-brand-dark underline">Knowledge hub</Link><Link href="/tools/profit-calculator" className="font-semibold text-brand-dark underline">Profit calculator</Link><Link href="/tools/stock-calculator" className="font-semibold text-brand-dark underline">Stock calculator</Link></div></article></section>
      <section className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Your business deserves a clearer picture.</h2><p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">Set up your shop, invite your team, and start recording sales today.</p><Link href="/signup" className="mt-8 inline-block rounded-xl bg-brand px-6 py-3.5 font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Get started with DukaSmart</Link></section>
      <MarketingFooter />
    </main>
    </LocalizedContent>
  );
}
