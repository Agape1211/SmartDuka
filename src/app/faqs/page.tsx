import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/MarketingLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Shop management FAQs",
  "Answers about DukaSmart shop accounts, employee access, credit sales, mobile use, stock management, and support.",
  "/faqs",
);

const questions = [["What is DukaSmart?", "DukaSmart is a sales and inventory management platform for small retail businesses. It helps you record sales, manage products and stock, record purchases, and review reports."], ["Can I create my own shop account?", "Yes. Select Start free, enter your shop and owner details, and you will be signed in to your new dashboard."], ["Can my employees use DukaSmart?", "Yes. Owners can create employee accounts for their shop. Employees can record sales and purchases, while owner-only reporting stays protected."], ["Does DukaSmart support credit sales?", "Yes. When recording a sale, choose paid or credit and optionally include customer details. Reports show outstanding credit totals."], ["Can I use it on my phone?", "Yes. The interface is responsive and designed to work at the counter on phones, tablets, and desktop computers."], ["How can I get help?", "Contact us on WhatsApp and our team will help you with setup or questions."]];

export default function FaqsPage() {
  return <MarketingPage eyebrow="Help centre" title="Frequently asked questions" intro="Quick answers to help you get started with DukaSmart."><div className="space-y-3">{questions.map(([question, answer]) => <details key={question} className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"><summary className="cursor-pointer list-none pr-8 font-bold text-slate-900 marker:hidden">{question}<span aria-hidden="true" className="float-right text-xl text-brand-dark group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl leading-7 text-slate-600">{answer}</p></details>)}</div><p className="mt-10 text-center text-slate-600">Still need help? <Link href="/contact" className="font-semibold text-brand-dark hover:underline">Contact us on WhatsApp.</Link></p></MarketingPage>;
}
