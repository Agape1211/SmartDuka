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

  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
    const { from, to } = monthRange(month);

    const report = await getSalesReport(session.shopId, from, to);
    return NextResponse.json({ month, ...report }, { headers: { "Cache-Control": "no-store" } });
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
    console.error("Failed to load monthly sales report", error);
    return NextResponse.json(
      { error: "Could not load the monthly report. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
