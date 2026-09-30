import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SearchContentPage } from "@/components/SearchContent";
import { createPageMetadata } from "@/lib/seo";
import { solutions } from "@/lib/seo-content";

export const dynamicParams = false;
export function generateStaticParams() { return solutions.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) return {};
  return createPageMetadata(solution.metaTitle, solution.description, `/solutions/${solution.slug}`);
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) notFound();
  return <SearchContentPage page={solution} kind="solution" />;
}