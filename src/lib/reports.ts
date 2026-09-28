import { query } from "@/lib/db";

export type ReportRow = {
  id: string;
  created_at: string;
  customer_name: string | null;
  payment_status: "PAID" | "CREDIT";
  recorded_by_name: string;
  total: string;
  items: { productName: string; quantity: number; unitPrice: string; unitCost: string }[];
};

export async function getSalesReport(shopId: string, from: Date, to: Date) {
  const salesResult = await query<ReportRow>(
    `SELECT s.id, s.created_at, s.customer_name, s.payment_status, s.total,
            u.name AS recorded_by_name,
            COALESCE(json_agg(json_build_object(
              'productName', p.name,
              'quantity', si.quantity,
              'unitPrice', si.unit_price,
              'unitCost', si.unit_cost
            ) ORDER BY si.id) FILTER (WHERE si.id IS NOT NULL), '[]') AS items
     FROM sales s
     JOIN users u ON u.id = s.recorded_by_id
     LEFT JOIN sale_items si ON si.sale_id = s.id
     LEFT JOIN products p ON p.id = si.product_id
     WHERE s.shop_id = $1 AND s.created_at >= $2 AND s.created_at < $3
     GROUP BY s.id, u.name
     ORDER BY s.created_at ASC`,
    [shopId, from.toISOString(), to.toISOString()]
  );

  const totalsResult = await query(
    `SELECT
       COALESCE(SUM(s.total), 0) AS revenue,
       COALESCE(SUM((si.unit_price - si.unit_cost) * si.quantity), 0) AS profit,
       COUNT(DISTINCT s.id) AS sale_count,
       COALESCE(SUM(CASE WHEN s.payment_status = 'CREDIT' THEN s.total ELSE 0 END), 0) AS credit_outstanding
     FROM sales s
     LEFT JOIN sale_items si ON si.sale_id = s.id
     WHERE s.shop_id = $1 AND s.created_at >= $2 AND s.created_at < $3`,
    [shopId, from.toISOString(), to.toISOString()]
  );

  return {
    sales: salesResult.rows,
    totals: {
      revenue: totalsResult.rows[0].revenue as string,
      profit: totalsResult.rows[0].profit as string,
      saleCount: Number(totalsResult.rows[0].sale_count),
      creditOutstanding: totalsResult.rows[0].credit_outstanding as string,
    },
  };
}

/** Midnight-to-midnight range for a single day, in server-local time. */
export function dayRange(dateStr: string) {
  const from = new Date(`${dateStr}T00:00:00`);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from, to };
}

/** First-of-month to first-of-next-month range for a "YYYY-MM" string. */
export function monthRange(monthStr: string) {
  const [y, m] = monthStr.split("-").map(Number);
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 1);
  return { from, to };
}
