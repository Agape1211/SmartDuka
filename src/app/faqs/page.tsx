import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/MarketingLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "DukaSmart FAQs | Features, Setup, and Support",
  "Answers about DukaSmart's current sales and inventory features, owner and employee access, service scope, and WhatsApp support.",
  "/faqs",
);

const questions = [
  ["What is DukaSmart?", "DukaSmart is a sales and inventory management platform for small retail businesses. It helps you record sales, manage products and stock, record purchases, and review reports."],
  ["Can I create my own shop account?", "Yes. Select Start free, enter your shop and owner details, and you will be signed in to your new dashboard."],
  ["Can my employees use DukaSmart?", "Yes. Owners can create employee accounts for their shop. Employees can record sales and purchases, while owner-only reporting stays protected."],
  ["Does DukaSmart support credit sales?", "Yes. When recording a sale, choose paid or credit and optionally include customer details. Reports show outstanding credit totals."],
  ["What features are available in the app today?", "The live app includes product and stock records, sales, supplier purchases, paid or credit status, low-stock thresholds, owner dashboards, reports, and CSV/PDF exports. The app is designed for small retail workflows."],
  ["Are expenses, customer management, websites, and automation built into the app?", "Not currently. Websites, wider customer-management workflows, expense tracking, automated messaging, and third-party integrations are not built-in modules today. Some can be scoped as implementation services; software features should be prioritized from repeated customer needs."],
  ["Can I use it on my phone?", "Yes. The interface is responsive and designed to work at the counter on phones, tablets, and desktop computers."],
  ["How can I get help or share feedback?", "Use WhatsApp at +255 616 234 063 for support and to share product feedback and feature requests. Feedback from owners, employees, and trial users helps us prioritize the roadmap. Direct support is available; automated WhatsApp messaging is not a built-in product feature."],
];

export default function FaqsPage() {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <MarketingPage
      eyebrow="Help centre"
      title="Frequently asked questions"
      intro="Quick answers to help you get started with DukaSmart."
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <div className="space-y-3">
        {questions.map(([question, answer]) => (
          <details key={question} className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <summary className="cursor-pointer list-none pr-8 font-bold text-slate-900 marker:hidden">
              {question}
              <span aria-hidden="true" className="float-right text-xl text-brand-dark group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">{answer}</p>
          </details>
        ))}
      </div>
      <p className="mt-10 text-center text-slate-600">
        Still need help? <Link href="/contact" className="font-semibold text-brand-dark hover:underline">Visit the support page.</Link>
      </p>
    </MarketingPage>
  );
}
