import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAuthenticated } from "@/lib/session";
import { updateProduct, deleteProduct } from "@/lib/store";
import type { Product } from "@/lib/types";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  let body: Partial<Product>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const parsePrice = (v: unknown): number | null | undefined => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  const patch: Partial<Product> = {
    name: typeof body.name === "string" ? body.name.trim() : undefined,
    category: typeof body.category === "string" ? body.category.trim() : undefined,
    description: typeof body.description === "string" ? body.description.trim() : undefined,
    priceBulk: parsePrice(body.priceBulk),
    pricePerKilo: parsePrice(body.pricePerKilo),
    priceHalfKilo: parsePrice(body.priceHalfKilo),
    price250g: parsePrice(body.price250g),
    disabled: typeof body.disabled === "boolean" ? body.disabled : undefined,
  };

  // Remove undefined fields
  (Object.keys(patch) as (keyof typeof patch)[]).forEach((k) => {
    if (patch[k] === undefined) delete patch[k];
  });

  const found = await updateProduct(id, patch);
  if (!found) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }
  revalidateTag("catalog", { expire: 0 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const found = await deleteProduct(id);
  if (!found) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }
  revalidateTag("catalog", { expire: 0 });
  return NextResponse.json({ ok: true });
}
