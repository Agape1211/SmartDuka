import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public");
const work = mkdtempSync(path.join(tmpdir(), "dukasmart-demo-"));
const width = 1280;
const height = 720;
const duration = 5.2;
const fade = 0.5;

const escapeXml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");
const text = (value, x, y, size = 16, fill = "#334155", weight = 400) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="Noto Sans, sans-serif" font-size="${size}" font-weight="${weight}">${escapeXml(value)}</text>`;
const rect = (x, y, w, h, fill, radius = 12, stroke = "none") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
const line = (x1, y1, x2, y2, stroke = "#e2e8f0", strokeWidth = 1) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
const scenes = [
  {
    nav: "Dashboard",
    title: "Good morning, Asha",
    subtitle: "Here is what is happening in your shop today.",
    cards: [["Sales today", "TZS 428,000", "+12% this week", "#ecfdf5", "#047857"],
      ["Credit to follow up", "TZS 96,000", "8 open balances", "#eff6ff", "#1d4ed8"],
      ["Stock health", "88%", "3 items running low", "#fff7ed", "#c2410c"]],
    panel: "overview",
  },
  {
    nav: "New Sale",
    title: "A faster sale at the counter",
    subtitle: "Add items, choose payment, and save the transaction.",
    cards: [["Items in this sale", "3 products", "Ready to checkout", "#ecfdf5", "#047857"],
      ["Payment", "Paid", "Cash received", "#eff6ff", "#1d4ed8"],
      ["Sale total", "TZS 18,500", "Stock updates on save", "#f5f3ff", "#6d28d9"]],
    panel: "sale",
  },
  {
    nav: "Products",
    title: "Know what is on your shelves",
    subtitle: "Product quantities stay connected to sales and purchases.",
    cards: [["Products tracked", "126", "Across 8 categories", "#ecfdf5", "#047857"],
      ["Running low", "3 items", "Review before restocking", "#fff7ed", "#c2410c"],
      ["Stock value", "TZS 4.8M", "At recorded cost prices", "#eff6ff", "#1d4ed8"]],
    panel: "inventory",
  },
  {
    nav: "Purchases",
    title: "Keep restocking records together",
    subtitle: "Log supplier deliveries, quantities, and unit costs.",
    cards: [["This month", "TZS 1.24M", "12 purchase records", "#ecfdf5", "#047857"],
      ["Last delivery", "Today", "Mlimani Wholesale", "#eff6ff", "#1d4ed8"],
      ["Items received", "42 units", "Inventory updated", "#f5f3ff", "#6d28d9"]],
    panel: "purchase",
  },
  {
    nav: "Reports",
    title: "Make the next decision with clarity",
    subtitle: "Review sales, credit, and product performance at a glance.",
    cards: [["Sales this month", "TZS 8.6M", "Across 384 transactions", "#ecfdf5", "#047857"],
      ["Gross profit est.", "TZS 1.7M", "Based on recorded costs", "#eff6ff", "#1d4ed8"],
      ["Outstanding credit", "TZS 310,000", "Review customer balances", "#fff7ed", "#c2410c"]],
    panel: "reports",
  },
];

function renderCard([label, value, note, tint, accent], x) {
  return [
    rect(x, 227, 292, 108, "#ffffff", 15, "#e2e8f0"),
    rect(x + 16, 245, 9, 9, accent, 5),
    text(label, x + 34, 254, 14, "#64748b", 600),
    text(value, x + 16, 287, 23, "#0f172a", 700),
    rect(x + 16, 301, 172, 22, tint, 11),
    text(note, x + 26, 317, 11, accent, 600),
  ].join("");
}

function rows(items, x, y, width = 520) {
  return items.map(([name, meta, amount], index) => {
    const top = y + index * 52;
    return [
      index ? line(x, top - 15, x + width, top - 15) : "",
      text(name, x, top + 2, 14, "#1e293b", 600),
      text(meta, x, top + 21, 11, "#64748b"),
      text(amount, x + width - 98, top + 7, 13, "#0f766e", 700),
    ].join("");
  }).join("");
}

function panel(title, x, y, w, h) {
  return `${rect(x, y, w, h, "#ffffff", 16, "#e2e8f0")}${text(title, x + 20, y + 32, 16, "#0f172a", 700)}`;
}

function panelContent(kind) {
  if (kind === "overview") {
    return [
      panel("Sales this week", 300, 363, 570, 275),
      text("Daily sales", 324, 416, 12, "#64748b", 600),
      ...[72, 118, 91, 156, 132, 190, 166].map((barHeight, i) => {
        const x = 340 + i * 68;
        return `${rect(x, 586 - barHeight, 34, barHeight, i === 5 ? "#0f766e" : "#99f6e4", 8)}${text(["M", "T", "W", "T", "F", "S", "S"][i], x + 11, 610, 11, "#64748b")}`;
      }),
      panel("Needs attention", 890, 363, 350, 275),
      rows([["Rice 5kg", "4 packs left", "Low stock"], ["Cooking oil", "6 bottles left", "Review"], ["Soap bars", "18 units", "Healthy"]], 912, 426, 306),
      `${rect(912, 588, 306, 30, "#f0fdfa", 8)}${text("View stock alerts  →", 926, 608, 12, "#0f766e", 700)}`,
    ].join("");
  }
  if (kind === "sale") {
    return [
      panel("Current sale", 300, 363, 570, 275),
      rows([["Rice 5kg", "2 packs  ·  TZS 3,500 each", "TZS 7,000"], ["Cooking oil 1L", "1 bottle  ·  TZS 6,000", "TZS 6,000"], ["Sugar 1kg", "1 pack  ·  TZS 5,500", "TZS 5,500"]], 324, 428, 520),
      panel("Checkout", 890, 363, 350, 275),
      text("Subtotal", 914, 430, 13, "#64748b"),
      text("TZS 18,500", 1098, 430, 14, "#0f172a", 700),
      line(914, 448, 1216, 448),
      text("Payment received", 914, 478, 13, "#64748b"),
      `${rect(914, 495, 302, 34, "#ecfdf5", 9)}${text("✓  Paid in full", 926, 518, 13, "#047857", 700)}`,
      `${rect(914, 554, 302, 45, "#0f766e", 10)}${text("Save sale", 1023, 582, 14, "#ffffff", 700)}`,
    ].join("");
  }
  if (kind === "inventory") {
    return [
      panel("Product stock", 300, 363, 940, 275),
      text("PRODUCT", 324, 414, 11, "#64748b", 700),
      text("CATEGORY", 664, 414, 11, "#64748b", 700),
      text("QUANTITY", 864, 414, 11, "#64748b", 700),
      text("STATUS", 1060, 414, 11, "#64748b", 700),
      line(324, 428, 1216, 428),
      rows([["Rice 5kg", "Staples", "4 packs", "Low stock"], ["Cement 50kg", "Building", "12 bags", "In stock"], ["Cooking oil 1L", "Groceries", "6 bottles", "Low stock"], ["Soap bars", "Household", "18 units", "In stock"]], 324, 462, 892),
      `${rect(1050, 443, 145, 24, "#fff7ed", 12)}${text("Low stock", 1071, 460, 11, "#c2410c", 600)}`,
      `${rect(1050, 495, 145, 24, "#ecfdf5", 12)}${text("In stock", 1071, 512, 11, "#047857", 600)}`,
      `${rect(1050, 547, 145, 24, "#fff7ed", 12)}${text("Low stock", 1071, 564, 11, "#c2410c", 600)}`,
      `${rect(1050, 599, 145, 24, "#ecfdf5", 12)}${text("In stock", 1071, 616, 11, "#047857", 600)}`,
    ].join("");
  }
  if (kind === "purchase") {
    return [
      panel("Recent purchases", 300, 363, 570, 275),
      rows([["Mlimani Wholesale", "Today  ·  4 products received", "TZS 86,000"], ["Kariakoo Suppliers", "Yesterday  ·  6 products", "TZS 142,500"], ["Amani Distributors", "21 Oct  ·  3 products", "TZS 64,000"]], 324, 428, 520),
      panel("Delivery recorded", 890, 363, 350, 275),
      `${rect(914, 415, 302, 56, "#f0fdfa", 10)}${text("Supplier", 928, 437, 11, "#64748b")}${text("Mlimani Wholesale", 928, 458, 14, "#0f172a", 700)}`,
      text("Products received", 914, 506, 12, "#64748b", 600),
      text("Maize flour  ·  20 bags", 914, 531, 13, "#334155"),
      text("Cooking oil  ·  12 bottles", 914, 555, 13, "#334155"),
      `${rect(914, 579, 302, 34, "#ecfdf5", 9)}${text("✓  Stock quantities updated", 929, 601, 12, "#047857", 700)}`,
    ].join("");
  }
  return [
    panel("Sales performance", 300, 363, 570, 275),
    text("Daily totals · This month", 324, 416, 12, "#64748b", 600),
    ...[54, 91, 76, 122, 108, 164, 140].map((barHeight, i) => {
      const x = 342 + i * 68;
      return `${rect(x, 586 - barHeight, 34, barHeight, i === 5 ? "#0f766e" : "#99f6e4", 8)}${text(["M", "T", "W", "T", "F", "S", "S"][i], x + 11, 610, 11, "#64748b")}`;
    }),
    panel("Top products", 890, 363, 350, 275),
    rows([["Rice 5kg", "86 sold", "Strong"], ["Cooking oil", "64 sold", "Good"], ["Soap bars", "51 sold", "Good"]], 912, 426, 306),
    `${rect(912, 588, 306, 30, "#f0fdfa", 8)}${text("Reports help spot trends", 926, 608, 12, "#0f766e", 700)}`,
  ].join("");
}

function renderScene(scene, index) {
  const navItems = ["Dashboard", "New Sale", "Products", "Purchases", "Reports"];
  const sidebar = navItems.map((item, i) => {
    const y = 172 + i * 55;
    const active = item === scene.nav;
    return `${active ? rect(54, y - 25, 182, 40, "#ffffff", 9) : ""}${text(item, 75, y, 14, active ? "#0f766e" : "#d1fae5", active ? 700 : 500)}`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="1280" height="720" fill="#eaf4f2"/>
    ${rect(30, 26, 1220, 668, "#ffffff", 25, "#dbe8e5")}
    <path d="M55 26h1170a25 25 0 0 1 25 25v47H30V51a25 25 0 0 1 25-25Z" fill="#ffffff"/>
    ${line(30, 98, 1250, 98)}
    <circle cx="64" cy="63" r="15" fill="#0f766e"/>
    ${text("D", 58, 69, 17, "#ffffff", 700)}
    ${text("DukaSmart", 90, 69, 18, "#0f172a", 700)}
    ${text("ILLUSTRATIVE DEMO  ·  SAMPLE DATA", 861, 67, 11, "#64748b", 700)}
    <circle cx="1195" cy="63" r="14" fill="#ccfbf1"/>
    ${text("A", 1190, 68, 11, "#0f766e", 700)}
    <path d="M30 98h226v571H55a25 25 0 0 1-25-25Z" fill="#0f3f3d"/>
    ${text("YOUR SHOP", 58, 139, 10, "#99f6e4", 700)}
    ${sidebar}
    ${text("Mwanzo Shop", 58, 623, 13, "#ffffff", 600)}
    ${text("Owner workspace", 58, 644, 11, "#a7f3d0", 400)}
    ${text(scene.title, 300, 154, 26, "#0f172a", 700)}
    ${text(scene.subtitle, 300, 184, 13, "#64748b", 400)}
    ${scene.cards.map((card, i) => renderCard(card, 300 + i * 312)).join("")}
    ${panelContent(scene.panel)}
    ${rect(300, 656, 940, 1, "#e2e8f0", 0)}
    ${text(`DUKASMART  ·  EVERYDAY SHOP MANAGEMENT  ·  ${String(index + 1).padStart(2, "0")} / 05`, 300, 678, 10, "#64748b", 600)}
  </svg>`;
}

try {
  const frames = scenes.map((scene, index) => {
    const svgPath = path.join(work, `scene-${index}.svg`);
    const pngPath = path.join(work, `scene-${index}.png`);
    writeFileSync(svgPath, renderScene(scene, index));
    execFileSync("convert", ["-density", "144", svgPath, "-resize", `${width}x${height}!`, pngPath], { stdio: "inherit" });
    return pngPath;
  });

  const inputs = frames.flatMap((frame) => ["-loop", "1", "-framerate", "30", "-t", String(duration), "-i", frame]);
  const filters = [
    ...frames.map((_, index) => `[${index}:v]fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v${index}]`),
  ];
  let previous = "v0";
  for (let index = 1; index < frames.length; index += 1) {
    const next = `xf${index}`;
    filters.push(`[${previous}][v${index}]xfade=transition=fade:duration=${fade}:offset=${(duration - fade) * index}[${next}]`);
    previous = next;
  }
  execFileSync("ffmpeg", [
    "-y", ...inputs,
    "-filter_complex", filters.join(";"),
    "-map", `[${previous}]`,
    "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "22",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-metadata", "title=DukaSmart product demo",
    path.join(output, "dukasmart-demo.mp4"),
  ], { stdio: "inherit" });
  execFileSync("convert", [frames[0], "-quality", "86", path.join(output, "dukasmart-demo-poster.jpg")], { stdio: "inherit" });
  console.log("Generated public/dukasmart-demo.mp4 and public/dukasmart-demo-poster.jpg");
} finally {
  rmSync(work, { recursive: true, force: true });
}
