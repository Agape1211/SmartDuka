import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  if (session.role !== "OWNER") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const shopId = session.shopId;

  const [today, month, profit, topProducts, lowStock, productCount] = await Promise.all([
    query(
      `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS count
       FROM sales WHERE shop_id = $1 AND created_at::date = CURRENT_DATE`,
      [shopId]
    ),
    query(
      `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS count
       FROM sales
       WHERE shop_id = $1
         AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)`,
      [shopId]
    ),
    query(
      `SELECT COALESCE(SUM((si.unit_price - si.unit_cost) * si.quantity), 0) AS profit
       FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       WHERE s.shop_id = $1
         AND date_trunc('month', s.created_at) = date_trunc('month', CURRENT_DATE)`,
      [shopId]
    ),
    query(
      `SELECT p.id, p.name, SUM(si.quantity) AS units_sold,
              SUM(si.quantity * si.unit_price) AS revenue
       FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       JOIN products p ON p.id = si.product_id
       WHERE s.shop_id = $1
         AND date_trunc('month', s.created_at) = date_trunc('month', CURRENT_DATE)
       GROUP BY p.id, p.name
       ORDER BY units_sold DESC
       LIMIT 5`,
      [shopId]
    ),
    query(
      `SELECT id, name, stock, low_stock_at
       FROM products
       WHERE shop_id = $1 AND stock <= low_stock_at
       ORDER BY stock ASC
       LIMIT 20`,
      [shopId]
    ),
    query(`SELECT COUNT(*) AS count FROM products WHERE shop_id = $1`, [shopId]),
  ]);

  return NextResponse.json({
    today: { total: today.rows[0].total, count: Number(today.rows[0].count) },
    month: { total: month.rows[0].total, count: Number(month.rows[0].count) },
    monthProfit: profit.rows[0].profit,
    topProducts: topProducts.rows,
    lowStock: lowStock.rows,
    productCount: Number(productCount.rows[0].count),
  });
}
