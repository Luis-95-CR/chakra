import * as XLSX from "xlsx";
import type { Product } from "./types";

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
};

/** Lowercases, trims and strips accents for tolerant header matching. */
function normalize(value: string): string {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

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

let cuidCounter = 0;
function nextId(): string {
  cuidCounter += 1;
  return `p${Date.now().toString(36)}${cuidCounter.toString(36)}`;
}

/**
 * Parses the first sheet of an .xlsx/.xls file into products.
 * Throws ParseError when required columns are missing or there are no rows.
 */
export function parseExcel(buffer: ArrayBuffer): ParseResult {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    throw new ParseError("No se pudo leer el archivo. ¿Es un Excel válido?");
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new ParseError("El archivo no tiene ninguna hoja.");

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[sheetName],
    { defval: "" },
  );
  if (rows.length === 0) {
    throw new ParseError("La hoja está vacía: no hay filas de productos.");
  }

  // Build a map from normalized header -> the actual header string in the file.
  const headerLookup = new Map<string, string>();
  for (const header of Object.keys(rows[0])) {
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

    products.push({
      id: nextId(),
      category: str("category"),
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
