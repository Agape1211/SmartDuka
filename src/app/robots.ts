import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL("/sitemap.xml", process.env.NEXT_PUBLIC_SITE_URL).toString()
    : undefined;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/products", "/purchases", "/reports", "/sales"],
    },
    ...(sitemapUrl ? { sitemap: sitemapUrl } : {}),
  };
}
