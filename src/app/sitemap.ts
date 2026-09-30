import type { MetadataRoute } from "next";
import { articles, features, solutions } from "@/lib/seo-content";

const publicPaths = [
  "",
  "/about",
  "/faqs",
  "/contact",
  "/privacy",
  "/features",
  ...features.map(({ slug }) => `/features/${slug}`),
  "/solutions",
  ...solutions.map(({ slug }) => `/solutions/${slug}`),
  "/blog",
  ...articles.map(({ slug }) => `/blog/${slug}`),
  "/tools/profit-calculator",
  "/tools/stock-calculator",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return [];

  return publicPaths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
