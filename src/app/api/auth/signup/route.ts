import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import type { PoolClient } from "pg";
import { pool } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const signupSchema = z.object({ shopName: z.string().trim().min(2).max(120), name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254), password: z.string().min(10).max(128) });
type Account = { id: string; shop_id: string; name: string; email: string; role: "OWNER" };

function isUniqueViolation(error: unknown): error is { code: string } { return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "23505"; }

export async function POST(request: NextRequest) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a shop name, your name, a valid email, and a password of at least 10 characters." }, { status: 400 });
  const { shopName, name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  const admin = createAdminClient();
  const supabase = createClient(await cookies());
  let client: PoolClient | undefined;
  let transactionStarted = false;
  let authUserId: string | undefined;
  try {
    const databaseClient = await pool.connect();
    client = databaseClient;
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (createError || !created.user) {
      const conflict = createError?.code === "email_exists";
      return NextResponse.json(
        { error: conflict ? "An account already exists for this email. Please sign in." : "We could not create your account. Please try again." },
        { status: conflict ? 409 : 500 }
      );
    }
    authUserId = created.user.id;
    const { error: metadataError } = await admin.auth.admin.updateUserById(authUserId, {
      app_metadata: { role: "OWNER" },
    });
    if (metadataError) throw metadataError;

    await databaseClient.query("BEGIN");
    transactionStarted = true;
    const shop = await databaseClient.query<{ id: string }>("INSERT INTO shops (name) VALUES ($1) RETURNING id", [shopName]);
    const user = await databaseClient.query<Account>("INSERT INTO users (auth_user_id, shop_id, name, email, role) VALUES ($1, $2, $3, $4, 'OWNER') RETURNING id, shop_id, name, email, role", [authUserId, shop.rows[0].id, name, email]);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    await databaseClient.query("COMMIT");
    transactionStarted = false;
    const account = user.rows[0];
    return NextResponse.json({ user: { id: account.id, name: account.name, email: account.email, role: account.role } }, { status: 201 });
  } catch (error) {
    if (client && transactionStarted) await client.query("ROLLBACK").catch(() => undefined);
    if (authUserId) {
      await supabase.auth.signOut().catch(() => undefined);
      await admin.auth.admin.deleteUser(authUserId).catch(() => undefined);
    }
    if (isUniqueViolation(error)) return NextResponse.json({ error: "An account already exists for this email. Please sign in." }, { status: 409 });
    console.error("Failed to create shop account", error);
    return NextResponse.json({ error: "We could not create your shop account. Please try again." }, { status: 500 });
  } finally { client?.release(); }
}
