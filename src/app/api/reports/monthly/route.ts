import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSalesReport, monthRange } from "@/lib/reports";

// GET /api/reports/monthly?month=YYYY-MM
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  if (session.role !== "OWNER") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const { from, to } = monthRange(month);

  const report = await getSalesReport(session.shopId, from, to);
  return NextResponse.json({ month, ...report });
}
