import type { Metadata } from "next";
import { BlogIndex } from "@/components/SearchContent";
import { createPageMetadata } from "@/lib/seo";
import { articles } from "@/lib/seo-content";

export const metadata: Metadata = createPageMetadata("DukaSmart Journal", "Practical, field-tested guides to stock control, sales, credit, and running a small retail shop in Tanzania.", "/blog");

export default function BlogPage() {
  return <BlogIndex articles={articles} />;
}