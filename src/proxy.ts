import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "dukasmart_session";

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

async function getPayload(token: string | undefined) {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isOwnerOnly = OWNER_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const payload = await getPayload(token);

  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isOwnerOnly && payload.role !== "OWNER") {
    return NextResponse.redirect(new URL("/sales/new", req.url));
  }

  return NextResponse.next();
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
