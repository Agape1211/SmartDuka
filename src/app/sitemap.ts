import type { MetadataRoute } from "next";
import { articles, features, solutions } from "@/lib/seo-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dukasmart.online";

const staticPages = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/faqs", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly" as const, priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/features", changeFrequency: "monthly" as const, priority: 0.8 },
  ...features.map(({ slug }) => ({
    path: `/features/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),
  { path: "/solutions", changeFrequency: "monthly" as const, priority: 0.8 },
  ...solutions.map(({ slug }) => ({
    path: `/solutions/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/tools/profit-calculator", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/tools/stock-calculator", changeFrequency: "monthly" as const, priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPages.map(({ path, changeFrequency, priority }) => ({
      url: new URL(path, siteUrl).toString(),
      changeFrequency,
      priority,
    })),
    ...articles.map(({ slug, published }) => ({
      url: new URL(`/blog/${slug}`, siteUrl).toString(),
      lastModified: published,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
