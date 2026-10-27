import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LocalizedContent } from "@/components/LanguageProvider";
import { MarketingFooter } from "@/components/MarketingLayout";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dukasmart.online";

export const metadata: Metadata = {
  title: "Run Your Shop with Clarity",
  description:
    "Discover DukaSmart: a simple way for Tanzanian shop owners to manage sales, stock, credit, and daily performance.",
  alternates: { canonical: "/promo" },
  openGraph: {
    type: "website",
    url: `${siteUrl}/promo`,
    title: "Run Your Shop with Clarity | DukaSmart",
    description:
      "Sales, stock, credit, and shop reports in one simple system, built for Tanzanian retailers.",
    images: [{ url: "/promo/opengraph-image", width: 1200, height: 630, alt: "DukaSmart shop management for Tanzanian retailers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Run Your Shop with Clarity | DukaSmart",
    description:
      "Sales, stock, credit, and shop reports in one simple system, built for Tanzanian retailers.",
    images: ["/promo/opengraph-image"],
  },
};

const benefits = [
  "Record sales and purchases",
  "Keep an eye on stock",
  "Track customer credit",
  "Review shop performance",
];

export default function PromoPage() {
  return (
    <LocalizedContent>
      <main className="min-h-screen bg-[#f3faf8] px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <article className="relative isolate flex aspect-[4/5] w-full max-w-[540px] flex-col overflow-hidden rounded-[30px] bg-[#0b3e3b] p-6 text-white shadow-2xl shadow-teal-950/20 sm:rounded-[38px] sm:p-10">
            <div aria-hidden="true" className="absolute -right-28 -top-24 -z-10 size-80 rounded-full border-[48px] border-teal-300/10" />
            <div aria-hidden="true" className="absolute -bottom-36 -left-32 -z-10 size-96 rounded-full bg-emerald-300/10 blur-2xl" />

            <div className="flex items-center gap-3">
              <Image src="/dukasmart.png" alt="" width={46} height={46} className="rounded-full ring-2 ring-white/20" />
              <div>
                <p className="text-lg font-bold tracking-tight">DukaSmart</p>
                <p className="text-xs font-medium text-teal-100">Jua biashara yako</p>
              </div>
            </div>

            <div className="mt-auto mb-auto pt-9 sm:pt-12">
              <p className="inline-flex rounded-full border border-teal-200/25 bg-teal-100/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-100 sm:text-xs">
                Made for Tanzanian shops
              </p>
              <h1 className="mt-5 max-w-md text-[2.15rem] font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
                Run your shop with <span className="text-amber-300">clarity.</span>
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-teal-50/85 sm:text-base sm:leading-7">
                Sales, stock, credit, and daily reports together in one simple system.
              </p>

              <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-3 text-[11px] font-semibold sm:mt-8 sm:gap-x-4 sm:gap-y-4 sm:text-sm">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-2.5 py-2.5 sm:px-3 sm:py-3">
                    <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-300/15 text-[11px] text-emerald-200">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/"
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-center text-sm font-extrabold text-[#153c39] shadow-lg shadow-black/10 transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b3e3b] sm:text-base"
            >
              Explore DukaSmart <span aria-hidden="true">↗</span>
            </Link>
            <p className="mt-4 text-center text-xs font-semibold tracking-wide text-teal-100/80">dukasmart.online</p>
          </article>

          <div className="mt-6 flex w-full max-w-[540px] flex-col gap-3 sm:flex-row">
            <Link href="/" className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-brand px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
              Visit the website
            </Link>
            <Link href="/signup" className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
              Create an account
            </Link>
          </div>
          <p className="mt-4 max-w-md text-center text-sm leading-6 text-slate-500">
            Share this page with a shop owner who wants a clearer view of their business.
          </p>

          <section className="mt-12 w-full max-w-[540px] rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="reel-heading">
            <div className="text-center">
              <h2 id="reel-heading" className="text-xl font-bold text-slate-900">Watch the Instagram Reel</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Preview or download the vertical DukaSmart video to post as an Instagram Reel.</p>
            </div>
            <video
              controls
              playsInline
              preload="metadata"
              poster="/dukasmart-instagram-reel-poster.png"
              aria-label="DukaSmart vertical promotional video for Instagram"
              className="mx-auto mt-5 max-h-[70vh] w-auto max-w-full rounded-2xl bg-slate-950"
            >
              <source src="/dukasmart-instagram-reel.mp4" type="video/mp4" />
              Your browser does not support embedded video. Download the MP4 to watch it.
            </video>
            <a
              href="/dukasmart-instagram-reel.mp4"
              download="dukasmart-instagram-reel.mp4"
              className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-brand px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Download Instagram Reel (MP4)
            </a>
            <p className="mt-3 text-center text-xs text-slate-500">Add your preferred Instagram audio or voiceover when posting.</p>
          </section>
        </div>
        <div className="mx-auto mt-10 max-w-5xl">
          <MarketingFooter />
        </div>
      </main>
    </LocalizedContent>
  );
}
