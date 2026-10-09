import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  email: z.string().trim().min(1).max(254),
  password: z.string().min(1),
});

async function resolveLoginEmail(identifier: string) {
  const trimmed = identifier.trim();
  if (!trimmed) return null;
  const normalized = trimmed.toLowerCase();

  if (normalized.includes("@")) {
    return normalized;
  }

  const result = await query<{ email: string }>(
    `SELECT email FROM users WHERE lower(name) = $1 OR lower(email) = $1 LIMIT 1`,
    [normalized]
  );

  return result.rows[0]?.email ?? null;
}

async function migrateLegacyAccount(email: string, password: string) {
  const legacy = await query<{
    id: string;
    shop_id: string;
    name: string;
    password_hash: string | null;
    role: "OWNER" | "EMPLOYEE";
  }>(
    `SELECT id, shop_id, name, password_hash, role
     FROM users WHERE lower(email) = $1 AND auth_user_id IS NULL LIMIT 1`,
    [email]
  );
  const profile = legacy.rows[0];
  if (!profile?.password_hash || !(await bcrypt.compare(password, profile.password_hash))) {
    return false;
  }

  const admin = createAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: profile.name },
  });
  if (error || !created.user) return false;

  const authUserId = created.user.id;
  const { error: metadataError } = await admin.auth.admin.updateUserById(authUserId, {
    app_metadata: { role: profile.role, shop_id: profile.shop_id },
  });
  if (metadataError) {
    await admin.auth.admin.deleteUser(authUserId);
    return false;
  }

  const linked = await query(
    `UPDATE users SET auth_user_id = $1, password_hash = NULL
     WHERE id = $2 AND auth_user_id IS NULL RETURNING id`,
    [authUserId, profile.id]
  );
  if (linked.rowCount !== 1) {
    await admin.auth.admin.deleteUser(authUserId);
    return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }
  const { password } = parsed.data;
  const email = await resolveLoginEmail(parsed.data.email);
  if (!email) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const supabase = createClient(await cookies());
  let { error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });
  if (error && await migrateLegacyAccount(email.toLowerCase(), password)) {
    ({ error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    }));
  }
  if (error) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const session = await getSession();
  if (!session) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "This account is not linked to a shop." }, { status: 403 });
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
    },
  });
}
