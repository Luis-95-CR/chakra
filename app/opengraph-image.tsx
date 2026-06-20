import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config";
import { getSettings } from "@/lib/store";

// Social share card (WhatsApp, Facebook, X…). Rendered to PNG at request time
// so the preview always reflects the current tagline.
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const settings = await getSettings();
  const tagline = settings.tagline ?? siteConfig.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          color: "#fbeeea",
          background:
            "linear-gradient(135deg, #6e2a22 0%, #8a3a2d 55%, #5a201a 100%)",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#e8b9a8",
          }}
        >
          {siteConfig.kicker}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 132,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 44,
            color: "#f3d9d0",
            maxWidth: 900,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
