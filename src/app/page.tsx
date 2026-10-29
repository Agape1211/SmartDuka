import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { MarketingFooter } from "@/components/MarketingLayout";
import { BrandAvatar } from "@/components/BrandAvatar";
import { LanguageSwitcher, LocalizedContent } from "@/components/LanguageProvider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "DukaSmart | Shop Management Software for Tanzanian Retailers" },
  description: "DukaSmart helps Tanzanian shop owners record sales, manage stock, track purchases, monitor credit, and review daily business reports in one simple system.",
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
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-dark">Sign in</Link>
            <Link href="/signup" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Sign up</Link>
          </div>
        </header>

        <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:pb-20 lg:pt-20">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-brand-dark">Built for Tanzanian retail shops</p>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Manage sales, stock, credit and profit in one simple system.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              DukaSmart gives shop owners a clearer way to record sales, monitor inventory, track purchases and review daily performance from one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="rounded-xl bg-brand px-6 py-3.5 text-center font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Sign up</Link>
              <Link href="/demo" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center font-semibold text-slate-700 transition hover:border-brand hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Watch demo</Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Sales tracking</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Stock control</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Credit records</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Owner reports</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg rounded-[28px] border border-teal-100 bg-white p-5 shadow-2xl shadow-teal-950/10 sm:p-7" aria-label="Example DukaSmart shop dashboard">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <p className="font-bold text-slate-900">Mwanzo Shop</p>
                <p className="text-sm text-slate-500">Daily overview</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Today</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-teal-50 p-4">
                <p className="text-xs font-medium text-teal-800">Sales</p>
                <p className="mt-2 text-2xl font-bold text-brand-dark">TZS 428k</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-xs font-medium text-sky-800">Credit</p>
                <p className="mt-2 text-2xl font-bold text-sky-900">TZS 96k</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Top items</span>
                <span className="text-slate-400">Updated</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Cement 50kg</span>
                    <span className="font-semibold text-brand-dark">12 bags</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-3/4 rounded-full bg-brand" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Rice 5kg</span>
                    <span className="font-semibold text-amber-700">4 packs</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-1/3 rounded-full bg-amber-500" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Soap bars</span>
                    <span className="font-semibold text-emerald-700">18 units</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-2/3 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-dark">Why duka owners choose DukaSmart</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Everything a busy shop needs, in one clear workflow.</h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Record sales fast", body: "Capture each sale quickly, choose paid or credit, and keep a clear transaction history without losing track of stock.", accent: "bg-teal-50 text-teal-800" },
              { title: "Manage stock smarter", body: "See what is selling, what is running low, and which products need a reorder before stock runs out.", accent: "bg-amber-50 text-amber-800" },
              { title: "Track purchases", body: "Record supplier deliveries, unit costs and quantities so restocking and profit checks stay connected.", accent: "bg-sky-50 text-sky-800" },
              { title: "Review business reports", body: "Use daily and monthly summaries to understand sales, product performance and outstanding credit at a glance.", accent: "bg-emerald-50 text-emerald-800" },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.accent}`}>{item.title}</div>
                <p className="mt-4 text-base leading-7 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">How it works</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From a sale on the counter to a healthier business.</h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["1", "Record the sale", "When a customer buys, add the products, quantities and payment status in seconds."],
                ["2", "Update stock automatically", "Inventory drops as the sale is saved, keeping your records current."],
                ["3", "Track credit and purchases", "Follow who owes what and record supplier deliveries without juggling separate notes."],
                ["4", "Review reports", "Check daily or monthly totals to see what is selling and where attention is needed."],
              ].map(([step, title, body]) => (
                <div key={step} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-teal-400/15 text-sm font-bold text-teal-300">{step}</div>
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-300">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-dark">Built for real retail work</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">A cleaner way to run your duka without managing scattered records.</h2>
              <ul className="mt-7 space-y-4 text-base leading-7 text-slate-600">
                <li className="flex gap-3"><span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-brand-dark">✓</span><span>Keep sales, purchases and inventory in the same system instead of across notebooks and WhatsApp chats.</span></li>
                <li className="flex gap-3"><span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-brand-dark">✓</span><span>Spot products running low before they disappear from the shelf and create avoidable lost sales.</span></li>
                <li className="flex gap-3"><span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-brand-dark">✓</span><span>Understand which products and sales periods are helping the business grow, and where money is tied up.</span></li>
              </ul>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-sm text-slate-500">This week</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900">Shop health</h3>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Healthy</span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium text-slate-500">Cash sales</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">TZS 1.2M</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium text-slate-500">Credit</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">TZS 310k</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium text-slate-500">Stock health</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">88%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-dark">Ready to get started?</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Set up your shop account and start from your next sale.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">No long setup. Just create your account, set up your products and begin managing the daily flow of your duka.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="rounded-xl bg-brand px-6 py-3.5 font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">Sign up</Link>
              <Link href="/features" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-brand hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">See DukaSmart features</Link>
            </div>
          </div>
        </section>

        <MarketingFooter />
      </main>
    </LocalizedContent>
  );
}
