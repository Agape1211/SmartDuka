import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "DukaSmart | Sales & Stock Management for Tanzanian Shops",
    template: "%s | DukaSmart",
  },
  description:
    "Manage shop sales, stock, purchases, and business reports in one simple tool built for Tanzanian retailers.",
  applicationName: "DukaSmart",
  keywords: [
    "shop management software Tanzania",
    "inventory management Tanzania",
    "sales tracking for shops",
    "stock management software",
    "retail POS Tanzania",
  ],
  openGraph: {
    type: "website",
    locale: "en_TZ",
    siteName: "DukaSmart",
    title: "DukaSmart | Sales & Stock Management for Tanzanian Shops",
    description:
      "Manage shop sales, stock, purchases, and business reports in one simple tool built for Tanzanian retailers.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "DukaSmart shop management" }],
    ...(siteUrl ? { url: siteUrl } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "DukaSmart | Sales & Stock Management for Tanzanian Shops",
    description:
      "Manage shop sales, stock, purchases, and business reports in one simple tool built for Tanzanian retailers.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
