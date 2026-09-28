import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
