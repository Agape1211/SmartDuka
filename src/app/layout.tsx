import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/components/LanguageProvider";
import { WhatsAppSupportLink } from "@/components/WhatsAppSupportLink";
import type { Locale } from "@/lib/translations";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dukasmart.online";
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DukaSmart",
  url: siteUrl,
  sameAs: ["https://www.instagram.com/dukasmart23/"],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DukaSmart | Digital Operations for Tanzanian SMEs",
    template: "%s | DukaSmart",
  },
  description:
    "DukaSmart helps Tanzanian SMEs improve operations through practical implementation, automation, analytics, support, and shop software for sales, stock, purchases, and reports.",
  applicationName: "DukaSmart",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DukaSmart",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  keywords: [
    "SME operations software Tanzania",
    "DukaSmart",
    "Duka Smart Tanzania",
    "shop management software Tanzania",
    "sales and inventory software Tanzania",
    "inventory management software Tanzania",
    "shop sales software Tanzania",
    "stock management system Tanzania",
    "retail management software Tanzania",
    "hardware shop management software",
    "mini supermarket software Tanzania",
    "software for Tanzanian shops",
    "business operations software for SMEs",
    "mfumo wa usimamizi wa duka Tanzania",
    "mfumo wa mauzo na hisa Tanzania",
    "duka management software",
  ],
  openGraph: {
    type: "website",
    locale: "en_TZ",
    siteName: "DukaSmart",
    title: "DukaSmart | Digital Operations for Tanzanian SMEs",
    description:
      "Practical digital implementation, workflow improvement, support, and shop software for Tanzanian SMEs.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "DukaSmart digital operations for Tanzanian SMEs" }],
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "DukaSmart | Digital Operations for Tanzanian SMEs",
    description:
      "Practical digital implementation, workflow improvement, support, and shop software for Tanzanian SMEs.",
    images: ["/opengraph-image"],
  },
  verification: {
    other: { "msvalidate.01": "D7F7C68068A95803B73C9F7FA06304D8" },
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("dukasmart-language")?.value;
  const initialLocale: Locale = savedLocale === "sw" ? "sw" : "en";
  const hasSavedLocale = savedLocale === "sw" || savedLocale === "en";

  return (
    <html lang={initialLocale === "sw" ? "sw-TZ" : "en-TZ"} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <LanguageProvider initialLocale={initialLocale} hasSavedLocale={hasSavedLocale}>
          {children}
          <WhatsAppSupportLink />
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
