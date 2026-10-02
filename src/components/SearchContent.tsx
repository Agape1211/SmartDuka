import Link from "next/link";
import { MarketingPage } from "@/components/MarketingLayout";
import type { Article, SearchPage } from "@/lib/seo-content";

import { siteOrigin } from "@/lib/seo";

function StructuredData({ value }: { value: object }) {
  const json = JSON.stringify(value).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === items.length - 1 ? <span aria-current="page" className="text-slate-700">{item.label}</span> : <Link href={item.href} className="hover:text-brand-dark">{item.label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SearchContentPage({ page, kind }: { page: SearchPage; kind: "feature" | "solution" }) {
  const section = kind === "feature" ? "features" : "solutions";
  const crumbs = [{ label: "Home", href: "/" }, { label: section === "features" ? "Features" : "Solutions", href: `/${section}` }, { label: page.title, href: `/${section}/${page.slug}` }];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, item: new URL(item.href, siteOrigin).toString() })),
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <>
      <StructuredData value={structuredData} />
      <MarketingPage eyebrow={section === "features" ? "DukaSmart features" : "Solutions for retailers"} title={page.title} intro={page.intro}>
        <Breadcrumbs items={crumbs} />
        <article className="space-y-10 text-slate-700">
          {page.sections.map((sectionItem) => (
            <section key={sectionItem.heading}>
              <h2 className="text-2xl font-bold text-slate-950">{sectionItem.heading}</h2>
              <p className="mt-3 leading-8">{sectionItem.body}</p>
            </section>
          ))}
          <section>
            <h2 className="text-2xl font-bold text-slate-950">Common questions</h2>
            <div className="mt-4 space-y-3">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="rounded-lg border border-slate-200 bg-white px-5 py-4">
                  <summary className="cursor-pointer font-semibold text-slate-900">{faq.question}</summary>
                  <p className="mt-3 leading-7">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
          <section aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-2xl font-bold text-slate-950">Continue exploring</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {page.related.map((link) => <li key={link.href}><Link href={link.href} className="block rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-brand-dark hover:border-brand">{link.label} <span aria-hidden="true">→</span></Link></li>)}
            </ul>
          </section>
          <section className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold text-slate-950">Put a clearer routine in place</h2>
            <p className="mt-3 leading-7">Set up a DukaSmart shop account to try product, sales, and purchase workflows with your team.</p>
            <Link href="/signup" className="mt-5 inline-flex rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark">Create your shop account</Link>
          </section>
        </article>
      </MarketingPage>
    </>
  );
}

export function ArticlePage({ article }: { article: Article }) {
  const crumbs = [{ label: "Home", href: "/" }, { label: "Knowledge hub", href: "/blog" }, { label: article.title, href: `/blog/${article.slug}` }];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.published,
    dateModified: article.published,
    author: { "@type": "Organization", name: "DukaSmart", url: new URL("/about", siteOrigin).toString() },
    publisher: {
      "@type": "Organization",
      name: "DukaSmart",
      url: siteOrigin,
      logo: {
        "@type": "ImageObject",
        url: new URL("/dukasmart.png", siteOrigin).toString(),
      },
    },
    mainEntityOfPage: new URL(`/blog/${article.slug}`, siteOrigin).toString(),
  };
  return (
    <>
      <StructuredData value={structuredData} />
      <MarketingPage eyebrow={`Knowledge hub / ${article.category}`} title={article.title} intro={article.intro}>
        <Breadcrumbs items={crumbs} />
        <article className="space-y-9 text-slate-700">
          <p className="text-sm text-slate-500">DukaSmart editorial team · <time dateTime={article.published}>{new Date(`${article.published}T12:00:00Z`).toLocaleDateString("en-TZ", { day: "numeric", month: "long", year: "numeric" })}</time></p>
          {article.sections.map((sectionItem) => <section key={sectionItem.heading}><h2 className="text-2xl font-bold text-slate-950">{sectionItem.heading}</h2><p className="mt-3 leading-8">{sectionItem.body}</p></section>)}
          <section>
            <h2 className="text-2xl font-bold text-slate-950">Questions readers ask</h2>
            <div className="mt-4 space-y-3">{article.faqs.map((faq) => <details key={faq.question} className="rounded-lg border border-slate-200 bg-white px-5 py-4"><summary className="cursor-pointer font-semibold text-slate-900">{faq.question}</summary><p className="mt-3 leading-7">{faq.answer}</p></details>)}</div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-slate-950">Related resources</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">{article.related.map((link) => <li key={link.href}><Link href={link.href} className="block rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-brand-dark hover:border-brand">{link.label} <span aria-hidden="true">→</span></Link></li>)}</ul>
          </section>
        </article>
      </MarketingPage>
    </>
  );
}

export function ContentIndex({ title, intro, pages }: { title: string; intro: string; pages: { title: string; description: string; href: string; label: string }[] }) {
  const crumbs = [{ label: "Home", href: "/" }, { label: title, href: `/${title === "Knowledge hub" ? "blog" : title.toLowerCase()}` }];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, item: new URL(item.href, siteOrigin).toString() })),
  };
  return (
    <>
      <StructuredData value={structuredData} />
      <MarketingPage eyebrow="Explore DukaSmart" title={title} intro={intro}>
        <Breadcrumbs items={crumbs} />
        {title === "Knowledge hub" && <div className="mb-8 grid gap-3 sm:grid-cols-2"><Link href="/tools/profit-calculator" className="rounded-lg border border-teal-200 bg-teal-50 p-4 font-semibold text-brand-dark">Duka profit calculator →</Link><Link href="/tools/stock-calculator" className="rounded-lg border border-teal-200 bg-teal-50 p-4 font-semibold text-brand-dark">Stock reorder calculator →</Link></div>}
        <ul className="divide-y divide-slate-200 border-y border-slate-200">
          {pages.map((page) => <li key={page.href} className="py-6"><Link href={page.href} className="group"><span className="text-xl font-bold text-slate-950 group-hover:text-brand-dark">{page.title} <span aria-hidden="true">→</span></span><span className="mt-2 block leading-7 text-slate-600">{page.description}</span><span className="mt-2 block text-sm font-semibold text-brand-dark">{page.label}</span></Link></li>)}
        </ul>
      </MarketingPage>
    </>
  );
}