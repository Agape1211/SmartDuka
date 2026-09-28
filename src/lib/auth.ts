import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export type SessionPayload = {
  userId: string;
  shopId: string;
  role: "OWNER" | "EMPLOYEE";
  name: string;
  email: string;
};

export async function getSession(): Promise<SessionPayload | null> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const result = await query<SessionPayload>(
    `SELECT id AS "userId", shop_id AS "shopId", role, name, email
     FROM users WHERE auth_user_id = $1 LIMIT 1`,
    [data.user.id]
  );
  return result.rows[0] ?? null;
}

export async function requireSession() {
  return getSession();
}

