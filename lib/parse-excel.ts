import "server-only";
import ExcelJS from "exceljs";
import type { Product } from "./types";
import { fnv1a, normalize } from "./text";

/** Result of parsing an uploaded spreadsheet. */
export type ParseResult = {
  products: Product[];
  /** Human-friendly warnings (e.g. skipped empty rows). */
  warnings: string[];
};

export class ParseError extends Error {}

// Maps each Product field to the spreadsheet headers we accept for it.
// Matching is accent- and case-insensitive, so "Categoría" == "categoria".
const COLUMN_ALIASES: Record<keyof Product, string[]> = {
  id: [],
  category: ["categoria"],
  name: ["producto", "nombre"],
  description: ["descripcion", "detalle"],
  priceBulk: ["precio granel", "granel"],
  pricePerKilo: ["precio 1 kilo", "precio kilo", "1 kilo", "kilo"],
  priceHalfKilo: ["precio medio kilo", "medio kilo", "1/2 kilo"],
  price250g: ["precio 250 gramos", "250 gramos", "250 g", "250g"],
  disabled: [],
};

/** Parses a number that may use comma decimals, currency symbols, etc. */
function parsePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const cleaned = value
    .toString()
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // drop thousands separators "1.250"
    .replace(",", ".");
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

/** Stable ID derived from category + name so re-uploads don't invalidate carts.
 *  Collision suffix (-2, -3…) handles duplicate name+category rows. */
function productId(category: string, name: string, seen: Set<string>): string {
  const key = normalize(category + "|" + name);
  const base = fnv1a(key);
  let id = base;
  let n = 2;
  while (seen.has(id)) id = `${base}-${n++}`;
  seen.add(id);
  return id;
}

/** Extracts a plain JS value from an ExcelJS cell (handles formulas, rich text). */
function cellValue(raw: unknown): unknown {
  if (raw === null || raw === undefined) return "";
  if (typeof raw !== "object") return raw;
  // formula cell: { formula, result }
  if ("formula" in raw) return (raw as { result?: unknown }).result ?? "";
  // rich text: { richText: [{ text }] }
  if ("richText" in raw)
    return (raw as { richText: { text: string }[] }).richText
      .map((r) => r.text)
      .join("");
  // hyperlink: { text, hyperlink }
  if ("text" in raw) return (raw as { text: string }).text;
  return "";
}

/**
 * Parses the first sheet of an .xlsx/.xls file into products.
 * Throws ParseError when required columns are missing or there are no rows.
 */
export async function parseExcel(buffer: ArrayBuffer): Promise<ParseResult> {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(buffer);
  } catch {
    throw new ParseError("No se pudo leer el archivo. ¿Es un Excel válido?");
  }

  const ws = wb.worksheets[0];
  if (!ws) throw new ParseError("El archivo no tiene ninguna hoja.");

  // row.values is 1-based (index 0 is undefined); slice(1) normalizes it.
  const rawHeaders = (ws.getRow(1).values as unknown[]).slice(1);
  const headers = rawHeaders.map((v) => String(cellValue(v)));

  if (!headers.some(Boolean)) {
    throw new ParseError("La hoja está vacía: no hay filas de productos.");
  }

  // Build row objects keyed by header string, same shape as xlsx's sheet_to_json.
  const rows: Record<string, unknown>[] = [];
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const vals = (row.values as unknown[]).slice(1);
    const obj: Record<string, unknown> = {};
    headers.forEach((header, i) => {
      obj[header] = cellValue(vals[i]);
    });
    rows.push(obj);
  });

  if (rows.length === 0) {
    throw new ParseError("La hoja está vacía: no hay filas de productos.");
  }

  // Build a map from normalized header -> the actual header string in the file.
  const headerLookup = new Map<string, string>();
  for (const header of headers) {
    headerLookup.set(normalize(header), header);
  }

  // Resolve which actual header to read for each field.
  const resolved: Partial<Record<keyof Product, string>> = {};
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [
    keyof Product,
    string[],
  ][]) {
    for (const alias of aliases) {
      const match = headerLookup.get(normalize(alias));
      if (match) {
        resolved[field] = match;
        break;
      }
    }
  }

  if (!resolved.name) {
    throw new ParseError(
      'No se encontró la columna de producto. Agrega una columna "Producto".',
    );
  }

  const priceKeys = [
    "priceBulk",
    "pricePerKilo",
    "priceHalfKilo",
    "price250g",
  ] as const;
  if (!priceKeys.some((k) => resolved[k])) {
    throw new ParseError(
      "No se encontró ninguna columna de precio (Granel, 1 Kilo, Medio Kilo o 250 Gramos).",
    );
  }

  const warnings: string[] = [];
  const products: Product[] = [];
  const seenIds = new Set<string>();

  rows.forEach((row, index) => {
    const raw = (field: keyof Product): unknown =>
      resolved[field] ? row[resolved[field]!] : "";
    const str = (field: keyof Product): string => {
      const value = raw(field);
      return value === null || value === undefined ? "" : String(value).trim();
    };

    const name = str("name");
    if (!name) {
      warnings.push(`Fila ${index + 2}: sin nombre de producto, se omitió.`);
      return;
    }

    const category = str("category");
    products.push({
      id: productId(category, name, seenIds),
      category,
      name,
      description: str("description"),
      priceBulk: parsePrice(raw("priceBulk")),
      pricePerKilo: parsePrice(raw("pricePerKilo")),
      priceHalfKilo: parsePrice(raw("priceHalfKilo")),
      price250g: parsePrice(raw("price250g")),
    });
  });

  if (products.length === 0) {
    throw new ParseError("No se encontró ningún producto con nombre válido.");
  }

  return { products, warnings };
}
