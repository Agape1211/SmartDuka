import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

type Employee = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "OWNER") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const result = await query<Employee>(
    `SELECT id, name, email, created_at
     FROM users
     WHERE shop_id = $1 AND role = 'EMPLOYEE' AND is_active = TRUE
     ORDER BY name ASC`,
    [session.shopId]
  );
  return NextResponse.json({ employees: result.rows });
}

const removeSchema = z.object({ employeeId: z.string().uuid() });

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "OWNER") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const parsed = removeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid employee" }, { status: 400 });
  }

  const result = await query(
    `UPDATE users
     SET is_active = FALSE
     WHERE id = $1 AND shop_id = $2 AND role = 'EMPLOYEE' AND is_active = TRUE
     RETURNING id`,
    [parsed.data.employeeId, session.shopId]
  );
  if (result.rowCount !== 1) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}