import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/products?search=&category=&lowStockOnly=1
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() ?? "";
  const lowStockOnly = searchParams.get("lowStockOnly") === "1";

  const conditions: string[] = ["shop_id = $1"];
  const params: unknown[] = [session.shopId];

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    conditions.push(`LOWER(name) LIKE $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  if (lowStockOnly) {
    conditions.push(`stock <= low_stock_at`);
  }

  const result = await query(
    `SELECT id, name, category, unit, cost_price, sell_price, stock, low_stock_at, created_at
     FROM products
     WHERE ${conditions.join(" AND ")}
     ORDER BY name ASC`,
    params
  );

  const categories = await query(
    `SELECT DISTINCT category FROM products WHERE shop_id = $1 ORDER BY category ASC`,
    [session.shopId]
  );

  return NextResponse.json({
    products: result.rows,
    categories: categories.rows.map((r) => r.category),
  });
}

const createSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1).default("piece"),
  costPrice: z.number().nonnegative(),
  sellPrice: z.number().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
  lowStockAt: z.number().int().nonnegative().default(5),
});

// POST /api/products — create a product
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const p = parsed.data;

  const result = await query(
    `INSERT INTO products (shop_id, name, category, unit, cost_price, sell_price, stock, low_stock_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, category, unit, cost_price, sell_price, stock, low_stock_at`,
    [
      session.shopId,
      p.name,
      p.category,
      p.unit,
      p.costPrice,
      p.sellPrice,
      p.stock,
      p.lowStockAt,
    ]
  );

  return NextResponse.json({ product: result.rows[0] }, { status: 201 });
}
