import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/config";
import { getSettings } from "@/lib/store";
import { WhatsAppButton } from "@/components/whatsapp-button";

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

function primaryColorStyle(hue: number): string {
  const h = hue;
  return [
    `:root{`,
    `--primary:oklch(0.34 0.078 ${h});`,
    `--primary-foreground:oklch(0.98 0.005 ${h});`,
    `--ring:oklch(0.34 0.078 ${h});`,
    `--accent:oklch(0.92 0.03 ${h});`,
    `--accent-foreground:oklch(0.34 0.078 ${h});`,
    `--secondary-foreground:oklch(0.32 0.05 ${h});`,
    `}`,
  ].join("");
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const waPhone = settings.whatsapp ?? siteConfig.whatsapp;

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} h-full antialiased`}
    >
      {settings.primaryHue != null && (
        <style dangerouslySetInnerHTML={{ __html: primaryColorStyle(settings.primaryHue) }} />
      )}
      <body className="min-h-full flex flex-col bg-background">
        {children}
        {waPhone && <WhatsAppButton phone={waPhone} />}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
