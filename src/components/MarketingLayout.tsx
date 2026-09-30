"use client";

import Link from "next/link";
import { BrandAvatar } from "@/components/BrandAvatar";
import {
  LanguageSwitcher,
  LocalizedContent,
  useLanguage,
} from "@/components/LanguageProvider";

const footerLinks = [
  { href: "/features", label: "Features" },
  { href: "/solutions", label: "Shop solutions" },
  { href: "/blog", label: "Knowledge hub" },
  { href: "/tools/profit-calculator", label: "Profit calculator" },
  { href: "/tools/stock-calculator", label: "Stock calculator" },
  { href: "/about", label: "About" },
  { href: "/faqs", label: "FAQs" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  const { t } = useLanguage();
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-5 py-5 sm:px-8">
      <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-brand-dark" aria-label="DukaSmart home">
        <BrandAvatar /><span>DukaSmart</span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher />
        <Link href="/login" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:text-brand-dark sm:px-3">{t("Sign in")}</Link>
        <Link href="/signup" className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark sm:px-4">{t("Start free")}</Link>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  const { t, locale } = useLanguage();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-7 text-sm text-slate-500 sm:flex-row sm:px-8">
        <p>© {new Date().getFullYear()} DukaSmart. {locale === "sw" ? "Jua biashara yako." : "Jua biashara yako."}</p>
        <nav aria-label={locale === "sw" ? "Viungo vya chini ya ukurasa" : "Footer navigation"} className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {footerLinks.map((link) => <Link key={link.href} href={link.href} className="font-medium hover:text-brand-dark">{t(link.label)}</Link>)}
        </nav>
      </div>
    </footer>
  );
}

export function MarketingPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-[#f7fbfa] text-slate-900">
      <MarketingHeader />
      <section className="border-y border-teal-100 bg-teal-50/60">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-dark">{t(eyebrow)}</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{t(title)}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{t(intro)}</p>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-18"><LocalizedContent>{children}</LocalizedContent></section>
      <MarketingFooter />
    </main>
  );
}
