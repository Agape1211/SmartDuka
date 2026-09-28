import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes only the Owner role may view.
const OWNER_ONLY_PREFIXES = ["/dashboard", "/reports"];
// Routes that require any logged-in user (Owner or Employee).
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/reports",
  "/products",
  "/sales",
  "/purchases",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isOwnerOnly = OWNER_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  let supabaseResponse = NextResponse.next({ request: req });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
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
  if (!isProtected) return supabaseResponse;

  let redirectUrl: URL | null = null;
  if (!user) {
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
    "/dashboard/:path*",
    "/reports/:path*",
    "/products/:path*",
    "/sales/:path*",
    "/purchases/:path*",
  ],
};
