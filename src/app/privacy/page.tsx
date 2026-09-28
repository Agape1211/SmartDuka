import type { Metadata } from "next";
import { MarketingPage } from "@/components/MarketingLayout";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return <MarketingPage eyebrow="Privacy" title="Your business information matters." intro="This policy explains how DukaSmart handles the information provided when you use the platform. Last updated: 25 September 2026."><div className="space-y-9 leading-8 text-slate-700"><Policy title="Information we store">We store account information such as your name, email address, role, and shop name. We also store the sales, product, inventory, purchase, and customer details that your team enters to provide the platform&apos;s core features.</Policy><Policy title="How we use information">We use your information to operate DukaSmart, authenticate users, show your shop&apos;s data to authorized team members, and maintain the security and reliability of the service.</Policy><Policy title="Access and security">Access to shop data is restricted by account and role. Passwords are stored as secure hashes, and sessions use HTTP-only cookies. Keep your password private and sign out when using a shared device.</Policy><Policy title="Sharing">We do not sell your business data. We only share information where necessary to operate the service, comply with applicable law, or protect the platform and its users.</Policy><Policy title="Your choices">Your shop owner can manage team access. Contact us if you need help with account information or have a privacy question.</Policy></div></MarketingPage>;
}

function Policy({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2 className="text-xl font-bold text-slate-950">{title}</h2><p className="mt-2">{children}</p></section>; }
