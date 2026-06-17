import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/session";
import { saveSettings } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: SiteSettings;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const rawHue = Number(body.primaryHue);
  const settings: SiteSettings = {
    whatsapp: typeof body.whatsapp === "string" ? body.whatsapp.trim() : undefined,
    tagline: typeof body.tagline === "string" ? body.tagline.trim() : undefined,
    primaryHue: !isNaN(rawHue) && rawHue >= 0 && rawHue <= 360 ? rawHue : undefined,
  };

  await saveSettings(settings);

  return NextResponse.json({ saved: true });
}
