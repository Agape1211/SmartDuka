import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/dashboard/chart?days=14 — daily sales totals for the trailing N days
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  if (session.role !== "OWNER") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const days = Math.min(parseInt(searchParams.get("days") ?? "14", 10) || 14, 90);

  const result = await query(
    `SELECT d::date AS day, COALESCE(SUM(s.total), 0) AS total
     FROM generate_series(CURRENT_DATE - ($2::int - 1), CURRENT_DATE, interval '1 day') d
     LEFT JOIN sales s ON s.shop_id = $1 AND s.created_at::date = d::date
     GROUP BY d
     ORDER BY d ASC`,
    [session.shopId, days]
  );

  return NextResponse.json({ points: result.rows });
}
