import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pool, query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/sales?limit=20 — recent sales for this shop
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 100);

  const sales = await query(
    `SELECT s.id, s.payment_status, s.customer_name, s.customer_phone, s.total, s.created_at,
            u.name AS recorded_by_name,
            COALESCE(json_agg(json_build_object(
              'productName', p.name,
              'quantity', si.quantity,
              'unitPrice', si.unit_price
            ) ORDER BY si.id) FILTER (WHERE si.id IS NOT NULL), '[]') AS items
     FROM sales s
     JOIN users u ON u.id = s.recorded_by_id
     LEFT JOIN sale_items si ON si.sale_id = s.id
     LEFT JOIN products p ON p.id = si.product_id
     WHERE s.shop_id = $1
     GROUP BY s.id, u.name
     ORDER BY s.created_at DESC
     LIMIT $2`,
    [session.shopId, limit]
  );

  return NextResponse.json({ sales: sales.rows });
}

const saleSchema = z.object({
  paymentStatus: z.enum(["PAID", "CREDIT"]),
  customerName: z.string().trim().optional().nullable(),
  customerPhone: z.string().trim().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

// POST /api/sales — record a sale. Decrements stock atomically; rejects if
// any line item would oversell current stock.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const parsed = saleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid sale data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { paymentStatus, customerName, customerPhone, items } = parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the involved product rows so concurrent sales can't oversell.
    const productIds = items.map((i) => i.productId);
    const productsResult = await client.query(
      `SELECT id, name, stock, sell_price, cost_price FROM products
       WHERE id = ANY($1) AND shop_id = $2
       FOR UPDATE`,
      [productIds, session.shopId]
    );
    const productsById = new Map(productsResult.rows.map((p) => [p.id, p]));

    let total = 0;
    for (const item of items) {
      const product = productsById.get(item.productId);
      if (!product) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            error: `Not enough stock for "${product.name}" — only ${product.stock} left.`,
          },
          { status: 409 }
        );
      }
      total += item.quantity * parseFloat(product.sell_price);
    }

    const saleResult = await client.query(
      `INSERT INTO sales (shop_id, recorded_by_id, payment_status, customer_name, customer_phone, total)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [
        session.shopId,
        session.userId,
        paymentStatus,
        customerName || null,
        customerPhone || null,
        total,
      ]
    );
    const saleId = saleResult.rows[0].id;

    for (const item of items) {
      const product = productsById.get(item.productId)!;
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, unit_cost)
         VALUES ($1, $2, $3, $4, $5)`,
        [saleId, item.productId, item.quantity, product.sell_price, product.cost_price]
      );
      await client.query(
        `UPDATE products SET stock = stock - $1, updated_at = now() WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json(
      { sale: { id: saleId, total, createdAt: saleResult.rows[0].created_at } },
      { status: 201 }
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
