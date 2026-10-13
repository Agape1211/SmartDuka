import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  if (session.role !== "OWNER") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const result = await query(
      `SELECT s.id, s.created_at, s.customer_name, s.customer_phone, s.total,
            COALESCE(SUM(p.amount), 0)::text AS amount_paid,
            GREATEST(s.total - COALESCE(SUM(p.amount), 0), 0)::text AS outstanding,
            COALESCE(json_agg(json_build_object(
              'id', p.id,
              'amount', p.amount,
              'createdAt', p.created_at,
              'recordedBy', u.name
            ) ORDER BY p.created_at DESC) FILTER (WHERE p.id IS NOT NULL), '[]') AS payments
     FROM sales s
     LEFT JOIN sale_payments p ON p.sale_id = s.id
     LEFT JOIN users u ON u.id = p.recorded_by_id
     WHERE s.shop_id = $1 AND s.payment_status = 'CREDIT'
     GROUP BY s.id
     HAVING s.total > COALESCE(SUM(p.amount), 0)
       ORDER BY s.created_at DESC`,
      [session.shopId]
    );

    const outstanding = result.rows.reduce(
      (total, sale) => total + Number(sale.outstanding),
      0
    );
    return NextResponse.json({ debts: result.rows, outstanding });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error
      ? error.code
      : undefined;
    if (code === "42P01") {
      return NextResponse.json(
        { error: "Debt payments are not set up yet. Apply db/migrations/20261013_sales_payments.sql to the database." },
        { status: 503 }
      );
    }
    console.error("Failed to load customer debts", error);
    return NextResponse.json({ error: "Could not load debts. Please try again." }, { status: 500 });
  }
}