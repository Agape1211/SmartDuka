import type { Metadata } from "next";
import { MarketingPage } from "@/components/MarketingLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(
  "Privacy policy",
  "Read how DukaSmart handles account, shop, sales, product, and customer information and protects access to business data.",
  "/privacy",
);

export default function PrivacyPage() {
  return <MarketingPage eyebrow="Privacy" title="Your business information matters." intro="This policy explains how DukaSmart handles the information provided when you use the platform. Last updated: 14 October 2026."><div className="space-y-9 leading-8 text-slate-700"><Policy title="Information we store">We store account information such as your name, email address, role, and shop name. We also store the sales, product, inventory, purchase, and customer details that your team enters to provide the platform&apos;s core features.</Policy><Policy title="How we use information">We use your information to operate DukaSmart, authenticate users, show your shop&apos;s data to authorized team members, and maintain the security and reliability of the service.</Policy><Policy title="Access and security">Access to shop data is restricted by account and role. Passwords are stored as secure hashes, and sessions use HTTP-only cookies. Keep your password private and sign out when using a shared device.</Policy><Policy title="Sharing">We do not sell your business data. We may use service providers, including Google, to display advertising. These providers may use cookies or similar technologies to show ads based on visits to this and other websites. Learn more about <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-dark underline">how Google uses advertising data</a> and manage your <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-dark underline">Google ad settings</a>. We also share information where necessary to comply with applicable law or protect the platform and its users.</Policy><Policy title="Your choices">Your shop owner can manage team access. You can manage personalized advertising through your Google ad settings and control cookies through your browser. Contact us if you need help with account information or have a privacy question.</Policy></div></MarketingPage>;
}

function Policy({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2 className="text-xl font-bold text-slate-950">{title}</h2><p className="mt-2">{children}</p></section>; }
