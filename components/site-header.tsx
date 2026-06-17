"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
          <Logo className="size-10 text-primary sm:size-14" />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold uppercase tracking-wide sm:text-2xl">
              {siteConfig.name}
            </span>
            <span className="hidden text-[14px] font-medium uppercase tracking-wider text-muted-foreground sm:block">
              Granja Porcina
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-8">
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
                  "relative px-1 py-2 text-xs font-semibold sm:text-sm transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300",
                  active
                    ? "text-foreground after:w-full"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
