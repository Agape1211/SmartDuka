import type { Metadata } from "next";

const siteName = "DukaSmart";
export const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dukasmart.online";
const socialImage = "/opengraph-image";

export function createPageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: new URL(path, siteOrigin).toString() },
    openGraph: {
      type: "website",
      locale: "en_TZ",
      siteName,
      title: `${title} | ${siteName}`,
      description,
      url: new URL(path, siteOrigin).toString(),
      images: [{ url: socialImage, width: 1200, height: 630, alt: "DukaSmart shop management" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: [socialImage],
    },
  };
}
