import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function getOwnedProduct(id: string, shopId: string) {
  const result = await query(`SELECT * FROM products WHERE id = $1 AND shop_id = $2`, [
    id,
    shopId,
  ]);
  return result.rows[0] ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const { id } = await params;
  const product = await getOwnedProduct(id, session.shopId);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ product });
}

const updateSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  costPrice: z.number().nonnegative(),
  sellPrice: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  lowStockAt: z.number().int().nonnegative(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedProduct(id, session.shopId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  }
  const p = parsed.data;

  const result = await query(
    `UPDATE products
     SET name = $1, category = $2, unit = $3, cost_price = $4, sell_price = $5,
         stock = $6, low_stock_at = $7, updated_at = now()
     WHERE id = $8 AND shop_id = $9
     RETURNING id, name, category, unit, cost_price, sell_price, stock, low_stock_at`,
    [p.name, p.category, p.unit, p.costPrice, p.sellPrice, p.stock, p.lowStockAt, id, session.shopId]
  );

  return NextResponse.json({ product: result.rows[0] });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "OWNER") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getOwnedProduct(id, session.shopId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If the product has sale/purchase history, keep it but zero the stock instead
  // of a hard delete, so historical reports don't break.
  const used = await query(
    `SELECT 1 FROM sale_items WHERE product_id = $1
     UNION SELECT 1 FROM purchase_items WHERE product_id = $1
     LIMIT 1`,
    [id]
  );
  if (used.rows.length > 0) {
    return NextResponse.json(
      { error: "This product has sales/purchase history and can't be deleted. Set its stock to 0 instead." },
      { status: 409 }
    );
  }

  await query(`DELETE FROM products WHERE id = $1 AND shop_id = $2`, [id, session.shopId]);
  return NextResponse.json({ ok: true });
}
