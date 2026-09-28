import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pool, query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/purchases?limit=20
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 100);

  const purchases = await query(
    `SELECT pu.id, pu.supplier, pu.total, pu.created_at,
            u.name AS received_by_name,
            COALESCE(json_agg(json_build_object(
              'productName', p.name,
              'quantity', pi.quantity,
              'unitCost', pi.unit_cost
            ) ORDER BY pi.id) FILTER (WHERE pi.id IS NOT NULL), '[]') AS items
     FROM purchases pu
     JOIN users u ON u.id = pu.received_by_id
     LEFT JOIN purchase_items pi ON pi.purchase_id = pu.id
     LEFT JOIN products p ON p.id = pi.product_id
     WHERE pu.shop_id = $1
     GROUP BY pu.id, u.name
     ORDER BY pu.created_at DESC
     LIMIT $2`,
    [session.shopId, limit]
  );

  return NextResponse.json({ purchases: purchases.rows });
}

const purchaseSchema = z.object({
  supplier: z.string().trim().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        unitCost: z.number().nonnegative(),
      })
    )
    .min(1),
});

// POST /api/purchases — record stock received. Increments stock and updates
// the product's cost_price to the new unit cost (latest-cost basis).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const parsed = purchaseSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid purchase data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { supplier, items } = parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const productIds = items.map((i) => i.productId);
    const productsResult = await client.query(
      `SELECT id, name FROM products WHERE id = ANY($1) AND shop_id = $2 FOR UPDATE`,
      [productIds, session.shopId]
    );
    const productsById = new Map(productsResult.rows.map((p) => [p.id, p]));
    for (const item of items) {
      if (!productsById.has(item.productId)) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
    }

    const total = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);

    const purchaseResult = await client.query(
      `INSERT INTO purchases (shop_id, received_by_id, supplier, total)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [session.shopId, session.userId, supplier || null, total]
    );
    const purchaseId = purchaseResult.rows[0].id;

    for (const item of items) {
      await client.query(
        `INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost)
         VALUES ($1, $2, $3, $4)`,
        [purchaseId, item.productId, item.quantity, item.unitCost]
      );
      await client.query(
        `UPDATE products
         SET stock = stock + $1, cost_price = $2, updated_at = now()
         WHERE id = $3`,
        [item.quantity, item.unitCost, item.productId]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json(
      { purchase: { id: purchaseId, total, createdAt: purchaseResult.rows[0].created_at } },
      { status: 201 }
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
