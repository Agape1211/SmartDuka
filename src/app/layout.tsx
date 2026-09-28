import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
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
    ...(siteUrl ? { url: siteUrl } : {}),
  },
  twitter: {
    card: "summary",
    title: "DukaSmart | Sales & Stock Management for Tanzanian Shops",
    description:
      "Manage shop sales, stock, purchases, and business reports in one simple tool built for Tanzanian retailers.",
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
