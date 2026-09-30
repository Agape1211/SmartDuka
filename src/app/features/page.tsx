import type { Metadata } from "next";
import { ContentIndex } from "@/components/SearchContent";
import { createPageMetadata } from "@/lib/seo";
import { features } from "@/lib/seo-content";

export const metadata: Metadata = createPageMetadata("Shop management features", "Explore DukaSmart tools for shop sales, inventory, purchases, customer credit, and business reporting.", "/features");

export default function FeaturesPage() {
  return <ContentIndex title="Features" intro="Explore the everyday records DukaSmart brings together for small retailers: sales, stock, restocking, customer credit, and owner reports." pages={features.map((feature) => ({ title: feature.title, description: feature.description, href: `/features/${feature.slug}`, label: "Explore feature" }))} />;
}