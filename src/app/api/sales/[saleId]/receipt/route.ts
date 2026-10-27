import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatTZS } from "@/lib/money";

type ReceiptSale = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  payment_status: "PAID" | "CREDIT";
  total: string;
  shop_name: string;
  tagline: string;
  items: { productName: string; quantity: number; unitPrice: string }[];
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ saleId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const { saleId } = await params;
  const result = await query<ReceiptSale>(
    `SELECT s.id, s.created_at, s.customer_name, s.customer_phone,
            s.payment_status, s.total, sh.name AS shop_name, sh.tagline,
            COALESCE(json_agg(json_build_object(
              'productName', p.name,
              'quantity', si.quantity,
              'unitPrice', si.unit_price
            ) ORDER BY si.id) FILTER (WHERE si.id IS NOT NULL), '[]') AS items
     FROM sales s
     JOIN shops sh ON sh.id = s.shop_id
     LEFT JOIN sale_items si ON si.sale_id = s.id
     LEFT JOIN products p ON p.id = si.product_id
     WHERE s.id = $1 AND s.shop_id = $2
     GROUP BY s.id, sh.id`,
    [saleId, session.shopId]
  );
  const sale = result.rows[0];
  if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 });

  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ margin: 42, size: "A4" });
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(20).fillColor("#0f766e").text(sale.shop_name);
  doc.fontSize(10).fillColor("#475569").text(sale.tagline || "");
  doc.moveDown(1);
  doc.fontSize(16).fillColor("#0f172a").text("SALE RECEIPT");
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#334155");
  doc.text(`Receipt: ${sale.id}`);
  doc.text(`Date: ${new Date(sale.created_at).toLocaleString("en-TZ", { timeZone: "Africa/Dar_es_Salaam" })}`);
  doc.text(`Customer: ${sale.customer_name || "Walk-in customer"}`);
  if (sale.customer_phone) doc.text(`Phone: ${sale.customer_phone}`);
  doc.text(`Payment: ${sale.payment_status === "PAID" ? "Paid" : "On credit"}`);
  doc.moveDown(1);

  const columns = { item: 42, quantity: 340, price: 405, total: 485 };
  const tableWidth = 511;
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f172a");
  doc.text("Item", columns.item, doc.y, { width: 285 });
  doc.text("Qty", columns.quantity, doc.y - doc.currentLineHeight(), { width: 45, align: "right" });
  doc.text("Price", columns.price, doc.y - doc.currentLineHeight(), { width: 70, align: "right" });
  doc.text("Amount", columns.total, doc.y - doc.currentLineHeight(), { width: 68, align: "right" });
  doc.moveDown(0.4);
  doc.moveTo(columns.item, doc.y).lineTo(columns.item + tableWidth, doc.y).strokeColor("#cbd5e1").stroke();
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(10).fillColor("#334155");

  for (const item of sale.items) {
    const rowHeight = Math.max(doc.heightOfString(item.productName, { width: 285 }), doc.currentLineHeight());
    if (doc.y + rowHeight > 740) doc.addPage();
    const y = doc.y;
    doc.text(item.productName, columns.item, y, { width: 285 });
    doc.text(String(item.quantity), columns.quantity, y, { width: 45, align: "right" });
    doc.text(formatTZS(item.unitPrice), columns.price, y, { width: 70, align: "right" });
    doc.text(formatTZS(Number(item.unitPrice) * item.quantity), columns.total, y, { width: 68, align: "right" });
    doc.y = y + rowHeight + 8;
  }

  doc.moveDown(0.4);
  doc.moveTo(columns.item, doc.y).lineTo(columns.item + tableWidth, doc.y).strokeColor("#cbd5e1").stroke();
  doc.moveDown(0.6);
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a");
  doc.text(`TOTAL  TZS ${formatTZS(sale.total)}`, columns.item, doc.y, { width: tableWidth, align: "right" });
  doc.moveDown(1.5);
  doc.font("Helvetica").fontSize(10).fillColor("#475569").text("Thank you for shopping with us.", { align: "center" });

  doc.end();
  const pdfBuffer = await done;
  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${sale.id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}