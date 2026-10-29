import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/MarketingLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Watch the DukaSmart demo",
  "See how DukaSmart brings sales, stock, purchases, credit, and shop reports together in one simple workflow.",
  "/demo",
);

export default function DemoPage() {
  return (
    <MarketingPage
      eyebrow="DukaSmart product demo"
      title="A clearer view of your shop, in a few minutes."
      intro="See how everyday sales, stock, purchases, and reports fit together in DukaSmart."
    >
      <div className="space-y-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-xl shadow-slate-900/10">
          <video
            className="aspect-video w-full"
            controls
            playsInline
            preload="metadata"
            poster="/dukasmart-demo-poster.jpg"
            aria-label="DukaSmart product demo showing example shop management workflows"
          >
            <source src="/dukasmart-demo.mp4" type="video/mp4" />
            <track
              kind="captions"
              src="/dukasmart-demo.en.vtt"
              srcLang="en"
              label="English"
              default
            />
            <track
              kind="captions"
              src="/dukasmart-demo.sw.vtt"
              srcLang="sw"
              label="Kiswahili"
            />
            Your browser does not support embedded videos. You can{" "}
            <a href="/dukasmart-demo.mp4">download the demo video</a>.
          </video>
        </div>

        <p className="text-sm leading-6 text-slate-500">
          This illustrative walkthrough uses sample shop data and is not a live account.
        </p>

        <section className="rounded-2xl border border-teal-100 bg-teal-50/70 p-6 text-center sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Ready to manage your shop with more clarity?
          </h2>
          <p className="mt-3 text-slate-600">
            Set up your shop and start recording your next sale.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-flex rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          >
            Sign up
          </Link>
        </section>
      </div>
    </MarketingPage>
  );
}
