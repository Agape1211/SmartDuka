import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/SearchContent";
import { createPageMetadata } from "@/lib/seo";
import { articles } from "@/lib/seo-content";

export const dynamicParams = false;
export function generateStaticParams() { return articles.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) return {};
  return createPageMetadata(article.metaTitle, article.description, `/blog/${article.slug}`);
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();
  return <ArticlePage article={article} />;
}