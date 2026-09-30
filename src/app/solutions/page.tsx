import type { Metadata } from "next";
import { ContentIndex } from "@/components/SearchContent";
import { createPageMetadata } from "@/lib/seo";
import { solutions } from "@/lib/seo-content";

export const metadata: Metadata = createPageMetadata("Shop management by business type", "See how DukaSmart's sales and stock workflows fit hardware shops, mini supermarkets, electronics retailers, cosmetics shops, and general retail.", "/solutions");

export default function SolutionsPage() {
  return <ContentIndex title="Solutions" intro="Different shops face different stock and counter routines. Explore practical examples for common independent retail businesses, including what the current product supports and where it has limits." pages={solutions.map((solution) => ({ title: solution.title, description: solution.description, href: `/solutions/${solution.slug}`, label: "View shop workflow" }))} />;
}