"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useCart, useCartUI } from "@/lib/cart-context";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { okCount } = useCart();
  const { openCart } = useCartUI();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[5.25rem] sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5">
          <Logo className="size-10 text-primary sm:size-14" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-tight sm:text-[1.7rem]">
              {siteConfig.name}
            </span>
            <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground sm:block">
              Granja Porcina
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-7">
          <nav className="flex items-center gap-4 sm:gap-7">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-2 text-sm font-medium transition-colors after:absolute after:-bottom-px after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-300",
                    active
                      ? "text-foreground after:w-full"
                      : "text-muted-foreground hover:text-foreground hover:after:w-full",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {!pathname.startsWith("/admin") && (
            <button
              type="button"
              onClick={openCart}
              aria-label="Carrito"
              className="relative ml-1 flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-premium"
            >
              <ShoppingCart className="size-[1.15rem]" />
              {okCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground ring-2 ring-background">
                  {okCount > 9 ? "9+" : okCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
      {/* Brass hairline — the premium signature under the masthead. */}
      <div aria-hidden className="h-px rule-gold opacity-40" />
    </header>
  );
}
