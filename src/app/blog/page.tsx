import type { Metadata } from "next";
import { ContentIndex } from "@/components/SearchContent";
import { createPageMetadata } from "@/lib/seo";
import { articles } from "@/lib/seo-content";

export const metadata: Metadata = createPageMetadata("DukaSmart Knowledge Hub", "Practical guides to stock control, sales, credit, and running a small retail shop in Tanzania.", "/blog");

export default function BlogPage() {
  return <ContentIndex title="Knowledge hub" intro="Practical, plain-language guides for shop owners and teams. Learn how to improve stock routines, understand sales and profit, and choose tools that fit the way your business works." pages={articles.map((article) => ({ title: article.title, description: article.description, href: `/blog/${article.slug}`, label: article.category }))} />;
}