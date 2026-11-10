import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { appHostname, appOrigin, siteHostname } from "@/lib/site-urls";

// Routes only the Owner role may view.
const OWNER_ONLY_PREFIXES = ["/dashboard", "/reports", "/debts"];
// Routes that require any logged-in user (Owner or Employee).
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/reports",
  "/debts",
  "/products",
  "/sales",
  "/purchases",
];
const AUTH_PREFIXES = ["/login", "/signup"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isOwnerOnly = OWNER_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const hasSeparateAppHost = appHostname !== siteHostname;
  const isAppRoot =
    hasSeparateAppHost &&
    req.nextUrl.hostname === appHostname &&
    pathname === "/";

  if (
    hasSeparateAppHost &&
    req.nextUrl.hostname === siteHostname &&
    (isProtected || isAuthPage)
  ) {
    const appUrl = new URL(pathname + req.nextUrl.search, appOrigin);
    return NextResponse.redirect(appUrl, 308);
  }

  if (!isProtected && !isAppRoot) return NextResponse.next();

  let supabaseResponse = NextResponse.next({ request: req });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and publishable key must be configured");
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  let redirectUrl: URL | null = null;
  if (isAppRoot) {
    redirectUrl = new URL(
      !user
        ? "/login"
        : user.app_metadata.role === "OWNER"
          ? "/dashboard"
          : "/sales/new",
      req.url,
    );
  } else if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    redirectUrl = loginUrl;
  } else if (isOwnerOnly && user.app_metadata.role !== "OWNER") {
    redirectUrl = new URL("/sales/new", req.url);
  }

  if (!redirectUrl) return supabaseResponse;

  const redirectResponse = NextResponse.redirect(redirectUrl);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export const config = {
  matcher: [
    "/",
    "/login/:path*",
    "/signup/:path*",
    "/dashboard/:path*",
    "/reports/:path*",
    "/debts/:path*",
    "/products/:path*",
    "/sales/:path*",
    "/purchases/:path*",
  ],
};
