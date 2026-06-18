import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getCatalog } from "@/lib/store";
import { isAuthenticated } from "@/lib/session";

export const runtime = "nodejs";

const COLS = [
  { header: "Categoría", width: 245 },
  { header: "Producto",  width: 350 },
  { header: "Descripción", width: 500 },
  { header: "Granel",    width: 120 },
  { header: "1 Kilo",    width: 120 },
  { header: "Medio Kilo", width: 120 },
  { header: "250 Gramos", width: 120 },
] as const;

// Excel stores widths in character units; convert from px (Calibri 11pt @ 96dpi)
const pxToChar = (px: number) => Math.round((px - 12) / 7 + 1);

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { products } = await getCatalog();

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Productos");

  ws.columns = COLS.map((c) => ({ width: pxToChar(c.width) }));

  // Header row — bold
  const headerRow = ws.addRow(COLS.map((c) => c.header));
  headerRow.font = { bold: true };

  // Data rows
  for (const p of products) {
    const row = ws.addRow([
      p.category,
      p.name,
      p.description,
      p.priceBulk,
      p.pricePerKilo,
      p.priceHalfKilo,
      p.price250g,
    ]);

    if (p.disabled) {
      row.font = { strike: true };
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(buf as unknown as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="catalogo-${date}.xlsx"`,
    },
  });
}
