import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().max(254).optional().or(z.literal("")),
  password: z.string().min(10).max(128),
  role: z.enum(["OWNER", "EMPLOYEE"]).default("EMPLOYEE"),
});

function buildFallbackEmail(name: string) {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "user";
  return `${base}-${crypto.randomUUID().slice(0, 8)}@dukasmart.local`;
}

// Only a logged-in Owner may create new staff accounts for their shop.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "OWNER") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, password, role } = parsed.data;
  const email = parsed.data.email?.trim() ? parsed.data.email.trim().toLowerCase() : buildFallbackEmail(name);

  const existing = await query(`SELECT id FROM users WHERE email = $1`, [
    email,
  ]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (createError || !created.user) {
    const conflict = createError?.code === "email_exists";
    return NextResponse.json(
      { error: conflict ? "Email already in use" : "Could not create the account" },
      { status: conflict ? 409 : 500 }
    );
  }

  const authUserId = created.user.id;
  const { error: metadataError } = await admin.auth.admin.updateUserById(authUserId, {
    app_metadata: { role, shop_id: session.shopId },
  });
  if (metadataError) {
    await admin.auth.admin.deleteUser(authUserId);
    console.error("Failed to set staff role in Supabase Auth", metadataError);
    return NextResponse.json({ error: "Could not create the account" }, { status: 500 });
  }

  try {
    const result = await query(
      `INSERT INTO users (auth_user_id, shop_id, name, email, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [authUserId, session.shopId, name, email, role]
    );
    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (error) {
    await admin.auth.admin.deleteUser(authUserId);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    console.error("Failed to create staff profile", error);
    return NextResponse.json({ error: "Could not create the account" }, { status: 500 });
  }

}
