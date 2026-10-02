import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dukasmart.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/products",
        "/purchases",
        "/reports",
        "/sales",
        "/login",
        "/signup",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
