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

  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const { from, to } = dayRange(date);

    const report = await getSalesReport(session.shopId, from, to);
    return NextResponse.json({ date, ...report }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error
      ? error.code
      : undefined;
    if (code === "42P01") {
      return NextResponse.json(
        { error: "Reports need the payment ledger. Apply db/migrations/20261013_sales_payments.sql to the database." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }
    console.error("Failed to load daily sales report", error);
    return NextResponse.json(
      { error: "Could not load the daily report. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
