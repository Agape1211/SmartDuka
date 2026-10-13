import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";

const paymentSchema = z.object({
  amount: z
    .number()
    .positive()
    .max(9_999_999_999.99)
    .refine((amount) => Math.abs(amount * 100 - Math.round(amount * 100)) < 0.0000001),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ saleId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  if (session.role !== "OWNER") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const parsed = paymentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid payment amount" }, { status: 400 });
  }

  const { saleId } = await params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const saleResult = await client.query(
      `SELECT id, total
       FROM sales
       WHERE id = $1 AND shop_id = $2 AND payment_status = 'CREDIT'
       FOR UPDATE`,
      [saleId, session.shopId]
    );
    const sale = saleResult.rows[0];
    if (!sale) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Outstanding debt not found" }, { status: 404 });
    }

    const paymentsResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS amount_paid
       FROM sale_payments WHERE sale_id = $1`,
      [saleId]
    );
    const amountPaid = Number(paymentsResult.rows[0].amount_paid);
    const outstanding = Number(sale.total) - amountPaid;
    if (parsed.data.amount > outstanding + 0.000001) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Payment cannot be greater than the outstanding balance", outstanding },
        { status: 409 }
      );
    }

    await client.query(
      `INSERT INTO sale_payments (sale_id, recorded_by_id, amount)
       VALUES ($1, $2, $3)`,
      [saleId, session.userId, parsed.data.amount]
    );

    const newAmountPaid = amountPaid + parsed.data.amount;
    const newOutstanding = Math.max(Number(sale.total) - newAmountPaid, 0);
    if (newOutstanding <= 0.000001) {
      await client.query(
        `UPDATE sales SET payment_status = 'PAID' WHERE id = $1 AND shop_id = $2`,
        [saleId, session.shopId]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ amountPaid: newAmountPaid, outstanding: newOutstanding });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}