import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/config";
import { getCatalog, getSettings } from "@/lib/store";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/cart-drawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Condensed grotesque for headings — athletic/emblem feel matching the mascot.
const displayFont = Oswald({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const tagline = settings.tagline ?? siteConfig.tagline;
  return {
    title: `${siteConfig.name} — ${tagline}`,
    description: `Lista de precios de ${siteConfig.name}.`,
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
          <style dangerouslySetInnerHTML={{ __html: primaryColorStyle(settings.primaryHue, settings.primaryLightness ?? 0.58, settings.primaryChroma ?? 0.19) }} />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-background">
        <CartProvider products={products} waPhone={waPhone}>
          {children}
          <CartDrawer />
        </CartProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
