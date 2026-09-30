"use client";

import Link from "next/link";
import { BrandAvatar } from "@/components/BrandAvatar";
import { LanguageSwitcher, LocalizedContent, useLanguage } from "@/components/LanguageProvider";
import { usePathname, useRouter } from "next/navigation";

type NavItem = { href: string; label: string; ownerOnly?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", ownerOnly: true },
  { href: "/sales/new", label: "New Sale" },
  { href: "/products", label: "Products" },
  { href: "/purchases", label: "Purchases" },
  { href: "/reports", label: "Reports", ownerOnly: true },
];

export function AppShell({
  role,
  name,
  shopName,
  children,
}: {
  role: "OWNER" | "EMPLOYEE";
  name: string;
  shopName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const items = NAV_ITEMS.filter((item) => !item.ownerOnly || role === "OWNER");

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-brand text-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <BrandAvatar size={32} />
          <div>
            <p className="font-bold leading-tight">DukaSmart</p>
            <p className="text-[11px] text-teal-100 leading-tight">{shopName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={handleLogout}
            className="text-xs bg-white/15 px-3 py-1.5 rounded-lg"
          >
            {t("Logout")}
          </button>
        </div>
      </header>

      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col md:w-56 bg-brand-dark text-white px-4 py-6 shrink-0">
        <div className="mb-8 flex items-center gap-2">
          <BrandAvatar />
          <div>
            <p className="text-lg font-bold">DukaSmart</p>
            <p className="text-xs text-teal-100">{shopName}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-white/15 font-medium"
                  : "hover:bg-white/10 text-teal-50"
              }`}
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>
        <div className="pt-4 border-t border-white/10">
          <div className="mb-2"><LanguageSwitcher /></div>
          <p className="text-xs text-teal-100 mb-2">
            {name} · {t(role === "OWNER" ? "Owner" : "Employee")}
          </p>
          <button
            onClick={handleLogout}
            className="text-xs bg-white/10 hover:bg-white/20 w-full text-left px-3 py-2 rounded-lg"
          >
            {t("Logout")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-20 md:pb-6"><LocalizedContent>{children}</LocalizedContent></main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex justify-around py-2 z-10">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-[11px] px-2 py-1 rounded-lg ${
              pathname.startsWith(item.href)
                ? "text-brand font-semibold"
                : "text-slate-500"
            }`}
          >
            {t(item.label)}
          </Link>
        ))}
      </nav>
    </div>
  );
}
