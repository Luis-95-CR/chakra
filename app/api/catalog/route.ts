import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAuthenticated } from "@/lib/session";
import { addProduct, getCatalog } from "@/lib/store";
import type { Product } from "@/lib/types";
import { fnv1a, normalize } from "@/lib/text";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: Partial<Product>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 422 });
  }

  // Generate stable ID from name, avoiding collisions with existing products.
  const catalog = await getCatalog();
  const existing = new Set(catalog.products.map((p) => p.id));
  const base = fnv1a(normalize(name));
  let id = base;
  let n = 2;
  while (existing.has(id)) id = `${base}-${n++}`;

  const product: Product = {
    id,
    name,
    category: typeof body.category === "string" ? body.category.trim() : "",
    description: typeof body.description === "string" ? body.description.trim() : "",
    priceBulk: body.priceBulk != null ? Number(body.priceBulk) : null,
    pricePerKilo: body.pricePerKilo != null ? Number(body.pricePerKilo) : null,
    priceHalfKilo: body.priceHalfKilo != null ? Number(body.priceHalfKilo) : null,
    price250g: body.price250g != null ? Number(body.price250g) : null,
  };

  await addProduct(product);
  revalidateTag("catalog", { expire: 0 });
  return NextResponse.json(product, { status: 201 });
}
