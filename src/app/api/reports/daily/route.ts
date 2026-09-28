import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSalesReport, dayRange } from "@/lib/reports";

// GET /api/reports/daily?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  if (session.role !== "OWNER") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const { from, to } = dayRange(date);

  const report = await getSalesReport(session.shopId, from, to);
  return NextResponse.json({ date, ...report });
}
