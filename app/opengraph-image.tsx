import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/lib/config";

// Social share card (WhatsApp, Facebook, X…). Rendered to PNG at request time
// so the preview always reflects the current tagline.
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Palette mirrors the site tokens (globals.css), converted to hex since satori
// doesn't understand oklch().
const CREAM = "#fbf5ed"; // --background
const ESPRESSO = "#251c17"; // --foreground
const BOAR = "#691213"; // deep oxblood (darker shade of the CTA) for the mascot
const OXBLOOD = "#8b2725"; // --primary
const CREAM_FG = "#fdf4e7"; // --primary-foreground
const GOLD = "#c79d59"; // --gold
const MUTED = "#6e6058"; // --muted-foreground

// The boar mark is a monochrome SVG (#000000). Recolor it to coffee brown and
// inline it as a data URI so satori can rasterize it onto the cream card.
async function logoDataUri(): Promise<string> {
  const svg = await readFile(join(process.cwd(), "public/logo.svg"), "utf8");
  const tinted = svg.replaceAll("#000000", BOAR);
  return `data:image/svg+xml;base64,${Buffer.from(tinted).toString("base64")}`;
}

export default async function OpengraphImage() {
  const [logo, fraunces] = await Promise.all([
    logoDataUri(),
    readFile(join(process.cwd(), "assets/Fraunces-SemiBold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px 90px",
          background: CREAM,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
          {/* Kicker with the site's gold hairline rule before it */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 2, background: GOLD }} />
            <div
              style={{
                fontSize: 24,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              {siteConfig.kicker}
            </div>
          </div>

          <div
            style={{
              fontFamily: "Fraunces",
              marginTop: 18,
              fontSize: 122,
              fontWeight: 600,
              lineHeight: 1,
              color: ESPRESSO,
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 30,
              lineHeight: 1.25,
              color: MUTED,
            }}
          >
            {siteConfig.heroTitle}
          </div>

          {/* CTA — drives click-through on the share card */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 44,
              padding: "16px 34px",
              borderRadius: 999,
              background: OXBLOOD,
              color: CREAM_FG,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            Ver lista de precios
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={320} height={320} alt="" />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 600, style: "normal" },
      ],
    },
  );
}
