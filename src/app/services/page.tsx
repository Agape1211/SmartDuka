import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/MarketingLayout";
import { createPageMetadata } from "@/lib/seo";
import { siteOrigin } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "SME Digital Operations Services in Tanzania",
  "Practical digital business presence, system implementation, workflow automation, analytics, and ongoing technology support for Tanzanian SMEs.",
  "/services",
);

const services = [
  {
    title: "Digital business presence",
    description: "Create or improve a business website, online catalogue, Google business presence, and clear WhatsApp Business contact or order pathways.",
    examples: "Websites, product catalogues, contact links, and online enquiry flows",
  },
  {
    title: "Sales and inventory workflows",
    description: "Organize product records, purchases, sales, stock visibility, and reporting. Where a suitable system already exists, configure it around the team's actual process.",
    examples: "Workflow mapping, data setup, migration planning, staff training, and DukaSmart onboarding",
  },
  {
    title: "Dashboards and business reporting",
    description: "Bring useful operational measures into a clearer view and help owners establish consistent reporting routines from available business records.",
    examples: "Sales summaries, stock signals, operating indicators, and export or review workflows",
  },
  {
    title: "Workflow automation and integrations",
    description: "Identify repetitive steps that can be simplified with forms, notifications, connected tools, or small custom workflows. Each project begins with checking the existing tools and constraints.",
    examples: "Order capture, internal notifications, invoice steps, and data handoffs between tools",
  },
  {
    title: "Implementation and ongoing support",
    description: "Support a rollout with configuration, testing, documentation, staff onboarding, and follow-up so the new process works in everyday use.",
    examples: "Existing system setup, ERP implementation support, process documentation, and maintenance planning",
  },
];

const sectors = [
  "Retail and hardware",
  "Pharmacies and health-related retail",
  "Restaurants and food businesses",
  "Salons and personal care",
  "Wholesalers and distributors",
  "Guest houses and accommodation",
  "Agriculture and small manufacturing",
  "Training centres and private schools",
];

const process = [
  ["Discover", "Interview the people doing the work and map the process, tools, and recurring friction."],
  ["Prototype", "Agree on a small, testable improvement using suitable existing tools or a focused demonstration."],
  ["Pilot", "Implement with real users, train the team, and collect feedback and operational results."],
  ["Standardize", "Document what works, provide ongoing support, and reuse common workflows where appropriate."],
];

const servicesStructuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "SME Digital Operations Services",
  serviceType: services.map(({ title }) => title),
  description: "Digital presence, systems implementation, workflow automation, business reporting, and ongoing technology support for Tanzanian SMEs.",
  areaServed: { "@type": "Country", name: "Tanzania" },
  provider: { "@type": "Organization", "@id": `${siteOrigin}/#organization`, name: "DukaSmart", url: siteOrigin },
  url: `${siteOrigin}/services`,
};

export default function ServicesPage() {
  return (
    <MarketingPage
      eyebrow="Digital operations services"
      title="Practical systems for the work your business actually does."
      intro="We help Tanzanian SMEs improve day-to-day operations through digital implementation, workflow automation, business reporting, and ongoing technology support. We start with the problem, not a generic ERP pitch."
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesStructuredData) }} />
      <div className="space-y-14">
        <section aria-labelledby="services-heading">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-brand-dark">Ways we can help</p>
              <h2 id="services-heading" className="mt-2 text-2xl font-bold text-slate-950">From a first workflow to a supported system</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {services.map((service, index) => (
              <article key={service.title} className="grid gap-3 py-6 sm:grid-cols-[3rem_1fr] sm:gap-5">
                <span className="font-mono text-sm font-bold text-brand-dark">0{index + 1}</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">{service.title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{service.description}</p>
                  <p className="mt-3 text-sm text-slate-500"><span className="font-semibold text-slate-700">Examples:</span> {service.examples}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="duka-heading" className="border-l-4 border-brand bg-teal-50/70 px-6 py-6 sm:px-8">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-dark">Live product</p>
          <h2 id="duka-heading" className="mt-2 text-2xl font-bold text-slate-950">DukaSmart today</h2>
          <p className="mt-3 leading-7 text-slate-700">The current DukaSmart platform supports small retailers with product and stock records, paid and credit sales, supplier purchases, low-stock thresholds, and owner sales reports. Website projects, expense management, automated notifications, and third-party integrations are service or future project areas, not built-in DukaSmart modules today.</p>
          <Link href="/features" className="mt-4 inline-block font-semibold text-brand-dark underline">See current product features</Link>
        </section>

        <section aria-labelledby="sectors-heading">
          <h2 id="sectors-heading" className="text-2xl font-bold text-slate-950">Businesses we can learn alongside</h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">We are especially interested in working with small and medium-sized teams where manual handoffs, fragmented records, or repeated admin work are slowing operations.</p>
          <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {sectors.map((sector) => <li key={sector} className="border-b border-slate-200 py-2 text-slate-700">{sector}</li>)}
          </ul>
        </section>

        <section aria-labelledby="process-heading">
          <h2 id="process-heading" className="text-2xl font-bold text-slate-950">A measured path from service to software</h2>
          <ol className="mt-5 grid gap-5 sm:grid-cols-2">
            {process.map(([title, description], index) => (
              <li key={title} className="border-t-2 border-brand pt-4">
                <span className="font-mono text-sm font-bold text-brand-dark">0{index + 1}</span>
                <h3 className="mt-2 font-bold text-slate-950">{title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{description}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 leading-7 text-slate-600">The long-term direction is to identify repeated customer problems, standardize proven solutions, and build focused reusable products where real demand supports them. We do not start by building a generic ERP.</p>
        </section>

        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-bold text-slate-950">Bring us one operational challenge</h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">A useful first conversation is about the task, who handles it, what currently goes wrong, and what a better result would look like.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center rounded-lg bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-dark">Discuss your workflow</Link>
            <Link href="/solutions" className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-brand hover:text-brand-dark">See shop workflows</Link>
          </div>
        </section>
      </div>
    </MarketingPage>
  );
}