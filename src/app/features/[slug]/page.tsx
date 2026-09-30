import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SearchContentPage } from "@/components/SearchContent";
import { createPageMetadata } from "@/lib/seo";
import { features } from "@/lib/seo-content";

export const dynamicParams = false;
export function generateStaticParams() { return features.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const feature = features.find((item) => item.slug === slug);
  if (!feature) return {};
  return createPageMetadata(feature.metaTitle, feature.description, `/features/${feature.slug}`);
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const feature = features.find((item) => item.slug === slug);
  if (!feature) notFound();
  return <SearchContentPage page={feature} kind="feature" />;
}