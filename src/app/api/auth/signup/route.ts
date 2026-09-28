import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, hashPassword, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { pool } from "@/lib/db";

const signupSchema = z.object({ shopName: z.string().trim().min(2).max(120), name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254), password: z.string().min(10).max(128) });
type Account = { id: string; shop_id: string; name: string; email: string; role: "OWNER" };

function isUniqueViolation(error: unknown): error is { code: string } { return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "23505"; }

export async function POST(request: NextRequest) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a shop name, your name, a valid email, and a password of at least 10 characters." }, { status: 400 });
  const { shopName, name, email, password } = parsed.data;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const shop = await client.query<{ id: string }>("INSERT INTO shops (name) VALUES ($1) RETURNING id", [shopName]);
    const passwordHash = await hashPassword(password);
    const user = await client.query<Account>("INSERT INTO users (shop_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, 'OWNER') RETURNING id, shop_id, name, email, role", [shop.rows[0].id, name, email.toLowerCase(), passwordHash]);
    await client.query("COMMIT");
    const account = user.rows[0];
    const token = await createSessionToken({ userId: account.id, shopId: account.shop_id, name: account.name, email: account.email, role: account.role });
    const response = NextResponse.json({ user: { id: account.id, name: account.name, email: account.email, role: account.role } }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    if (isUniqueViolation(error)) return NextResponse.json({ error: "An account already exists for this email. Please sign in." }, { status: 409 });
    console.error("Failed to create shop account", error);
    return NextResponse.json({ error: "We could not create your shop account. Please try again." }, { status: 500 });
  } finally { client.release(); }
}
