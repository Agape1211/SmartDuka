import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getSession } from "@/lib/auth";
import { getSalesReport, dayRange, monthRange } from "@/lib/reports";
import { formatTZS } from "@/lib/money";
import { query } from "@/lib/db";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  if (session.role !== "OWNER") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") === "monthly" ? "monthly" : "daily";
  const format = searchParams.get("format") === "pdf" ? "pdf" : "csv";

  let label: string;
  let from: Date;
  let to: Date;
  if (type === "daily") {
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    ({ from, to } = dayRange(date));
    label = `Daily report — ${date}`;
  } else {
    const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
    ({ from, to } = monthRange(month));
    label = `Monthly report — ${month}`;
  }

  const report = await getSalesReport(session.shopId, from, to);
  const shopResult = await query(`SELECT name, tagline FROM shops WHERE id = $1`, [
    session.shopId,
  ]);
  const shop = shopResult.rows[0] ?? { name: "DukaSmart", tagline: "" };

  const filenameBase = `dukasmart-${type}-report-${searchParams.get("date") ?? searchParams.get("month") ?? "export"}`;

  if (format === "csv") {
    const lines: string[] = [];
    lines.push(csvEscape(shop.name) + "," + csvEscape(label));
    lines.push("");
    lines.push(["Date/Time", "Customer", "Payment", "Recorded by", "Items", "Total (TZS)"].join(","));
    for (const sale of report.sales) {
      const itemsStr = sale.items
        .map((i) => `${i.productName} x${i.quantity}`)
        .join("; ");
      lines.push(
        [
          new Date(sale.created_at).toLocaleString("en-TZ"),
          sale.customer_name ?? "",
          sale.payment_status,
          sale.recorded_by_name,
          itemsStr,
          sale.total,
        ]
          .map((v) => csvEscape(String(v)))
          .join(",")
      );
    }
    lines.push("");
    lines.push(`Total sales,,,,,${report.totals.saleCount}`);
    lines.push(`Revenue (TZS),,,,,${report.totals.revenue}`);
    lines.push(`Estimated profit (TZS),,,,,${report.totals.profit}`);
    lines.push(`Outstanding credit (TZS),,,,,${report.totals.creditOutstanding}`);

    return new NextResponse(lines.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filenameBase}.csv"`,
      },
    });
  }

  // PDF
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  doc.on("data", (chunk) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(18).fillColor("#0f766e").text(shop.name, { continued: false });
  doc.fontSize(10).fillColor("#475569").text(shop.tagline || "");
  doc.moveDown(0.5);
  doc.fontSize(14).fillColor("#0f172a").text(label);
  doc.moveDown(1);

  doc.fontSize(10).fillColor("#0f172a");
  const colX = { date: 40, customer: 140, pay: 260, items: 320, total: 480 };
  doc.font("Helvetica-Bold");
  doc.text("Date/Time", colX.date, doc.y, { width: 95 });
  doc.text("Customer", colX.customer, doc.y - doc.currentLineHeight(), { width: 115 });
  doc.text("Pay", colX.pay, doc.y - doc.currentLineHeight(), { width: 55 });
  doc.text("Items", colX.items, doc.y - doc.currentLineHeight(), { width: 150 });
  doc.text("Total", colX.total, doc.y - doc.currentLineHeight(), { width: 70, align: "right" });
  doc.moveDown(0.3);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#e2e8f0").stroke();
  doc.moveDown(0.3);
  doc.font("Helvetica");

  for (const sale of report.sales) {
    const itemsStr = sale.items.map((i) => `${i.productName} x${i.quantity}`).join(", ");
    const itemsHeight = doc.heightOfString(itemsStr, { width: 150 });
    const rowHeight = Math.max(itemsHeight, doc.currentLineHeight());

    if (doc.y + rowHeight > 760) doc.addPage();
    const y = doc.y;

    doc.text(new Date(sale.created_at).toLocaleString("en-TZ"), colX.date, y, { width: 95 });
    doc.text(sale.customer_name ?? "—", colX.customer, y, { width: 115 });
    doc.text(sale.payment_status, colX.pay, y, { width: 55 });
    doc.text(itemsStr, colX.items, y, { width: 150 });
    doc.text(`${formatTZS(sale.total)}`, colX.total, y, { width: 70, align: "right" });

    doc.y = y + rowHeight + 8;
  }

  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#e2e8f0").stroke();
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold");
  doc.text(`Sales recorded: ${report.totals.saleCount}`, 40, doc.y, { width: 300 });
  doc.text(`Revenue: TZS ${formatTZS(report.totals.revenue)}`, 40, doc.y, { width: 300 });
  doc.text(`Estimated profit: TZS ${formatTZS(report.totals.profit)}`, 40, doc.y, { width: 300 });
  doc.text(`Outstanding credit: TZS ${formatTZS(report.totals.creditOutstanding)}`, 40, doc.y, { width: 300 });

  doc.end();
  const pdfBuffer = await done;

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
    },
  });
}
