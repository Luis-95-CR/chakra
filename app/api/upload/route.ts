import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAuthenticated } from "@/lib/session";
import { parseExcel, ParseError } from "@/lib/parse-excel";
import { saveCatalog } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const file = formData.get("file");
  const confirm = formData.get("confirm") === "true";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Adjunta un archivo de Excel (.xlsx)." },
      { status: 400 },
    );
  }

  let parsed;
  try {
    const buffer = await file.arrayBuffer();
    parsed = await parseExcel(buffer);
  } catch (error) {
    const message =
      error instanceof ParseError
        ? error.message
        : "No se pudo procesar el archivo.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  // Preview mode: return what we read without touching the live catalog.
  if (!confirm) {
    return NextResponse.json({
      preview: true,
      count: parsed.products.length,
      warnings: parsed.warnings,
      products: parsed.products,
    });
  }

  // Confirmed: replace the whole catalog.
  await saveCatalog({
    products: parsed.products,
    lastUploadAt: new Date().toISOString(),
  });
  revalidateTag("catalog", { expire: 0 });

  return NextResponse.json({
    saved: true,
    count: parsed.products.length,
    warnings: parsed.warnings,
  });
}
