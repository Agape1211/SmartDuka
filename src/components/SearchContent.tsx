import Link from "next/link";
import Script from "next/script";
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
      <AdsenseScript />
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

function AdsenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  if (!clientId || !/^ca-pub-\d+$/.test(clientId)) return null;

  return (
    <Script
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
    />
  );
}

export function BlogIndex({ articles }: { articles: Article[] }) {
  const categories = [...new Set(articles.map((article) => article.category))];
  const latestArticles = [...articles].sort((first, second) => second.published.localeCompare(first.published));
  const featuredArticle = latestArticles[0];
  const otherArticles = latestArticles.slice(1);
  const crumbs = [{ label: "Home", href: "/" }, { label: "Knowledge hub", href: "/blog" }];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "DukaSmart Knowledge Hub",
    description: "Practical guides to stock control, sales, credit, and running a small retail shop in Tanzania.",
    url: new URL("/blog", siteOrigin).toString(),
    blogPost: latestArticles.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      description: article.description,
      datePublished: article.published,
      url: new URL(`/blog/${article.slug}`, siteOrigin).toString(),
    })),
  };

  return (
    <>
      <AdsenseScript />
      <StructuredData value={structuredData} />
      <MarketingPage eyebrow="The DukaSmart journal" title="A better-run shop starts with a good idea." intro="Field-tested, straightforward advice for the people keeping Tanzania's shops moving: from everyday stock habits to smarter sales and cash decisions.">
          <Breadcrumbs items={crumbs} />
          <div className="mb-10 flex flex-wrap gap-2" aria-label="Article categories">
            {categories.map((category) => <span key={category} className="border border-teal-200 bg-white px-3 py-1.5 text-sm font-semibold text-brand-dark">{category}</span>)}
          </div>
          {featuredArticle && (
            <section aria-labelledby="featured-article" className="border-y border-teal-200 py-8 sm:py-10">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-dark">Latest guide · {featuredArticle.category}</p>
              <h2 id="featured-article" className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
                <Link href={`/blog/${featuredArticle.slug}`} className="hover:text-brand-dark">{featuredArticle.title}</Link>
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{featuredArticle.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <time dateTime={featuredArticle.published}>{formatArticleDate(featuredArticle.published)}</time>
                <span>·</span><span>{estimateReadingTime(featuredArticle)} min read</span>
                <Link href={`/blog/${featuredArticle.slug}`} className="font-bold text-brand-dark underline decoration-teal-300 underline-offset-4">Read the guide <span aria-hidden="true">→</span></Link>
              </div>
            </section>
          )}
          <section aria-labelledby="more-guides" className="pt-10">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
              <h2 id="more-guides" className="text-2xl font-bold text-slate-950">More practical guides</h2>
              <span className="text-sm text-slate-500">{articles.length} articles</span>
            </div>
            <ul className="divide-y divide-slate-200">
              {otherArticles.map((article) => (
                <li key={article.slug} className="py-6">
                  <article>
                    <p className="text-sm font-semibold text-brand-dark">{article.category} <span className="px-1 text-slate-400">·</span> <time dateTime={article.published}>{formatArticleDate(article.published)}</time></p>
                    <h3 className="mt-2 text-xl font-bold text-slate-950"><Link href={`/blog/${article.slug}`} className="hover:text-brand-dark">{article.title} <span aria-hidden="true">→</span></Link></h3>
                    <p className="mt-2 max-w-3xl leading-7 text-slate-600">{article.description}</p>
                    <p className="mt-2 text-sm text-slate-500">{estimateReadingTime(article)} min read</p>
                  </article>
                </li>
              ))}
            </ul>
          </section>
          <section className="mt-10 border-t border-slate-200 pt-8">
            <h2 className="text-xl font-bold text-slate-950">Put the ideas to work</h2>
            <p className="mt-2 leading-7 text-slate-600">Try the free stock and profit calculators, or see how DukaSmart brings everyday shop records together.</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-brand-dark">
              <Link href="/tools/stock-calculator" className="underline decoration-teal-300 underline-offset-4">Stock reorder calculator →</Link>
              <Link href="/tools/profit-calculator" className="underline decoration-teal-300 underline-offset-4">Shop profit calculator →</Link>
              <Link href="/features/inventory-management" className="underline decoration-teal-300 underline-offset-4">Inventory management →</Link>
            </div>
          </section>
      </MarketingPage>
    </>
  );
}

function formatArticleDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-TZ", { day: "numeric", month: "short", year: "numeric" });
}

function estimateReadingTime(article: Article) {
  const wordCount = [article.intro, ...article.sections.map((section) => `${section.heading} ${section.body}`)].join(" ").split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 220));
}