import type { MetadataRoute } from "next";

const publicPaths = ["", "/about", "/faqs", "/contact", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return [];

  return publicPaths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
