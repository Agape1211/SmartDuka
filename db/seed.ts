/**
 * DukaSmart demo seed — one hardware shop, an Owner + Employee login,
 * ~20 realistic products, a handful of restock purchases, and ~30 sample
 * sales spread across the last few weeks so the dashboard/reports/charts
 * have something real to show.
 *
 * Run with: npm run seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "../src/lib/db";

type ProductSeed = {
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  lowStockAt: number;
};

const PRODUCTS: ProductSeed[] = [
  { name: "Cement (Twiga) 50kg", category: "Building Materials", unit: "bag", costPrice: 16500, sellPrice: 19000, stock: 80, lowStockAt: 15 },
  { name: "Iron sheets (gauge 28)", category: "Building Materials", unit: "sheet", costPrice: 21000, sellPrice: 25500, stock: 60, lowStockAt: 10 },
  { name: "Steel bars 12mm", category: "Building Materials", unit: "piece", costPrice: 14000, sellPrice: 17000, stock: 100, lowStockAt: 20 },
  { name: "River sand", category: "Building Materials", unit: "bag", costPrice: 3000, sellPrice: 4000, stock: 120, lowStockAt: 25 },
  { name: "Common nails 3 inch", category: "Fasteners", unit: "kg", costPrice: 3200, sellPrice: 4200, stock: 90, lowStockAt: 15 },
  { name: "Roofing nails", category: "Fasteners", unit: "kg", costPrice: 3800, sellPrice: 5000, stock: 70, lowStockAt: 15 },
  { name: "Wood screws assorted", category: "Fasteners", unit: "box", costPrice: 6000, sellPrice: 8500, stock: 40, lowStockAt: 8 },
  { name: "Bolts & nuts M10", category: "Fasteners", unit: "piece", costPrice: 500, sellPrice: 800, stock: 200, lowStockAt: 40 },
  { name: "Emulsion paint (white) 20L", category: "Paint", unit: "bucket", costPrice: 45000, sellPrice: 55000, stock: 25, lowStockAt: 5 },
  { name: "Gloss paint 4L", category: "Paint", unit: "tin", costPrice: 22000, sellPrice: 28000, stock: 30, lowStockAt: 6 },
  { name: "Paint brush 4 inch", category: "Paint", unit: "piece", costPrice: 2500, sellPrice: 4000, stock: 50, lowStockAt: 10 },
  { name: "PVC pipe 1/2 inch", category: "Plumbing", unit: "piece", costPrice: 4500, sellPrice: 6000, stock: 65, lowStockAt: 12 },
  { name: "PVC pipe 4 inch", category: "Plumbing", unit: "piece", costPrice: 12000, sellPrice: 15500, stock: 35, lowStockAt: 8 },
  { name: "Water tap (brass)", category: "Plumbing", unit: "piece", costPrice: 8000, sellPrice: 11000, stock: 28, lowStockAt: 6 },
  { name: "PVC glue", category: "Plumbing", unit: "tin", costPrice: 3500, sellPrice: 5000, stock: 40, lowStockAt: 8 },
  { name: "Electrical wire 2.5mm (100m)", category: "Electrical", unit: "roll", costPrice: 65000, sellPrice: 78000, stock: 18, lowStockAt: 4 },
  { name: "Socket outlet", category: "Electrical", unit: "piece", costPrice: 3500, sellPrice: 5500, stock: 55, lowStockAt: 10 },
  { name: "LED bulb 9W", category: "Electrical", unit: "piece", costPrice: 3000, sellPrice: 4500, stock: 90, lowStockAt: 15 },
  { name: "Claw hammer", category: "Tools", unit: "piece", costPrice: 7000, sellPrice: 10000, stock: 22, lowStockAt: 5 },
  { name: "Tape measure 5m", category: "Tools", unit: "piece", costPrice: 4000, sellPrice: 6500, stock: 30, lowStockAt: 6 },
];

const CUSTOMER_NAMES: (string | null)[] = [
  "Juma Mwakisu",
  "Fatuma Ally",
  "Mr. Kileo (contractor)",
  "Neema Construction",
  "Baraka Builders",
  null,
  null,
  null, // several sales have no customer on file, like real walk-ins
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Wipe existing demo data so the seed is re-runnable.
    await client.query("DELETE FROM sale_items");
    await client.query("DELETE FROM purchase_items");
    await client.query("DELETE FROM sales");
    await client.query("DELETE FROM purchases");
    await client.query("DELETE FROM products");
    await client.query("DELETE FROM users");
    await client.query("DELETE FROM shops");

    const shopResult = await client.query(
      `INSERT INTO shops (name, tagline) VALUES ($1, $2) RETURNING id`,
      ["Baraka Hardware", "Jua biashara yako"]
    );
    const shopId = shopResult.rows[0].id;

    const ownerHash = await bcrypt.hash("owner123", 10);
    const employeeHash = await bcrypt.hash("employee123", 10);

    const ownerResult = await client.query(
      `INSERT INTO users (shop_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'OWNER') RETURNING id`,
      [shopId, "Amina Juma", "owner@dukasmart.test", ownerHash]
    );
    const ownerId = ownerResult.rows[0].id;

    const employeeResult = await client.query(
      `INSERT INTO users (shop_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'EMPLOYEE') RETURNING id`,
      [shopId, "Joseph Mushi", "employee@dukasmart.test", employeeHash]
    );
    const employeeId = employeeResult.rows[0].id;

    const staffIds = [ownerId, employeeId];

    // --- Products ---
    const productIds: { id: string; sellPrice: number; costPrice: number }[] = [];
    for (const p of PRODUCTS) {
      const res = await client.query(
        `INSERT INTO products (shop_id, name, category, unit, cost_price, sell_price, stock, low_stock_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [shopId, p.name, p.category, p.unit, p.costPrice, p.sellPrice, p.stock, p.lowStockAt]
      );
      productIds.push({ id: res.rows[0].id, sellPrice: p.sellPrice, costPrice: p.costPrice });
    }

    // Make a couple of products visibly low on stock for the demo, regardless
    // of the starting values above.
    await client.query(
      `UPDATE products SET stock = 3 WHERE shop_id = $1 AND name = 'Claw hammer'`,
      [shopId]
    );
    await client.query(
      `UPDATE products SET stock = 4 WHERE shop_id = $1 AND name = 'Water tap (brass)'`,
      [shopId]
    );

    // --- A few restock purchases over the last month ---
    const suppliers = ["Twiga Cement Ltd", "Dar Steel Suppliers", "Kilimanjaro Electricals", "Coastal Paints Co."];
    for (let i = 0; i < 5; i++) {
      const daysAgo = randomInt(3, 28);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const itemCount = randomInt(1, 3);
      const chosen = new Set<number>();
      while (chosen.size < itemCount) chosen.add(randomInt(0, productIds.length - 1));

      let total = 0;
      const purchaseResult = await client.query(
        `INSERT INTO purchases (shop_id, received_by_id, supplier, total, created_at)
         VALUES ($1, $2, $3, 0, $4) RETURNING id`,
        [shopId, ownerId, pick(suppliers), createdAt.toISOString()]
      );
      const purchaseId = purchaseResult.rows[0].id;

      for (const idx of chosen) {
        const product = productIds[idx];
        const qty = randomInt(10, 40);
        await client.query(
          `INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost)
           VALUES ($1, $2, $3, $4)`,
          [purchaseId, product.id, qty, product.costPrice]
        );
        total += qty * product.costPrice;
      }
      await client.query(`UPDATE purchases SET total = $1 WHERE id = $2`, [total, purchaseId]);
    }

    // --- ~30 sample sales over the last ~20 days ---
    for (let i = 0; i < 30; i++) {
      const daysAgo = randomInt(0, 20);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(randomInt(8, 18), randomInt(0, 59), 0, 0);

      const itemCount = randomInt(1, 4);
      const chosen = new Set<number>();
      while (chosen.size < itemCount) chosen.add(randomInt(0, productIds.length - 1));

      const paymentStatus = Math.random() < 0.25 ? "CREDIT" : "PAID";
      const customerName = pick(CUSTOMER_NAMES);
      const recordedBy = pick(staffIds);

      let total = 0;
      const saleResult = await client.query(
        `INSERT INTO sales (shop_id, recorded_by_id, payment_status, customer_name, customer_phone, total, created_at)
         VALUES ($1, $2, $3, $4, $5, 0, $6) RETURNING id`,
        [
          shopId,
          recordedBy,
          paymentStatus,
          customerName,
          customerName ? `07${randomInt(10000000, 99999999)}` : null,
          createdAt.toISOString(),
        ]
      );
      const saleId = saleResult.rows[0].id;

      for (const idx of chosen) {
        const product = productIds[idx];
        const qty = randomInt(1, 5);
        await client.query(
          `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, unit_cost)
           VALUES ($1, $2, $3, $4, $5)`,
          [saleId, product.id, qty, product.sellPrice, product.costPrice]
        );
        await client.query(
          `UPDATE products SET stock = GREATEST(stock - $1, 0) WHERE id = $2`,
          [qty, product.id]
        );
        total += qty * product.sellPrice;
      }
      await client.query(`UPDATE sales SET total = $1 WHERE id = $2`, [total, saleId]);
    }

    await client.query("COMMIT");

    console.log("Seeded demo shop: Baraka Hardware");
    console.log(`  ${PRODUCTS.length} products, 5 purchases, 30 sample sales`);
    console.log("Owner login:    owner@dukasmart.test / owner123");
    console.log("Employee login: employee@dukasmart.test / employee123");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
