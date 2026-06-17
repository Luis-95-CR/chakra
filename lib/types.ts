// Shared domain types for the product catalog.

export type Product = {
  id: string;
  category: string;
  name: string; // Excel column "Producto"
  description: string;
  /** Prices per presentation. Any of them may be null if not offered. */
  priceBulk: number | null; // Precio Granel
  pricePerKilo: number | null; // Precio 1 Kilo
  priceHalfKilo: number | null; // Precio Medio Kilo
  price250g: number | null; // Precio 250 Gramos
};

/** The whole catalog stored as a single document. */
export type Catalog = {
  products: Product[];
  lastUploadAt: string; // ISO timestamp
};

/** Price presentations in display order. Drives both UI and parsing. */
export const PRICE_FIELDS = [
  { key: "priceBulk", label: "Granel" },
  { key: "pricePerKilo", label: "1 Kilo" },
  { key: "priceHalfKilo", label: "½ Kilo" },
  { key: "price250g", label: "¼ Kilo" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<
    Product,
    "priceBulk" | "pricePerKilo" | "priceHalfKilo" | "price250g"
  >;
  label: string;
}>;

export type PriceFieldKey = (typeof PRICE_FIELDS)[number]["key"];
