import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/config";
import { getCatalog, getSettings } from "@/lib/store";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/cart-drawer";
import { ScrollToTop } from "@/components/scroll-to-top";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial old-style serif for headlines & prices — heritage craft-butcher
// voice with optical sizing for a premium, hand-set feel.
const displayFont = Fraunces({
  variable: "--font-display-serif",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
});

// Resolve the public origin so social cards (WhatsApp, etc.) get absolute URLs.
function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "https://la-chakra.org";
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const tagline = settings.tagline ?? siteConfig.tagline;
  // ~57 chars: fills the SERP/title space better than the bare brand + tagline.
  const title = `${siteConfig.name} — ${tagline} de res, cerdo y pollo fresco`;
  const description = siteConfig.heroSubtitle;

  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    // The og:image is supplied automatically by app/opengraph-image.tsx.
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url: "/",
      locale: "es_CR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function primaryColorStyle(hue: number, lightness: number, chroma: number): string {
  return [
    `:root{`,
    `--primary:oklch(${lightness} ${chroma} ${hue});`,
    `--primary-foreground:oklch(0.98 0.005 ${hue});`,
    `--ring:oklch(${lightness} ${chroma} ${hue});`,
    `--accent:oklch(0.94 0.04 ${hue});`,
    `--accent-foreground:oklch(0.34 0.078 ${hue});`,
    `--secondary-foreground:oklch(0.32 0.05 ${hue});`,
    `}`,
  ].join("");
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, catalog] = await Promise.all([getSettings(), getCatalog()]);
  const products = catalog.products.filter((p) => !p.disabled);
  const waPhone = settings.whatsapp ?? siteConfig.whatsapp;

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} h-full antialiased`}
    >
      <head>
        {settings.primaryHue != null && (
          <style dangerouslySetInnerHTML={{ __html: primaryColorStyle(settings.primaryHue, settings.primaryLightness ?? 0.43, settings.primaryChroma ?? 0.135) }} />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-background">
        <ScrollToTop />
        <CartProvider products={products} waPhone={waPhone}>
          {children}
          <CartDrawer />
        </CartProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
