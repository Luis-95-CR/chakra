import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CatalogClient } from "./catalog-client";
import { getCatalog, getSettings } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/config";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const [{ products, lastUploadAt }, settings, params] = await Promise.all([
    getCatalog(),
    getSettings(),
    searchParams,
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 fill-mode-both">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-3">
                <span className="h-px w-10 rule-gold" />
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  {siteConfig.name}
                </span>
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                {settings.tagline ?? siteConfig.tagline}
              </h1>
            </div>
            {products.length > 0 && (
              <p className="inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm text-muted-foreground shadow-sm">
                <span className="font-semibold text-foreground tabular-nums">{products.length}</span>{" "}
                productos
                <span className="text-border">·</span>
                <span className="text-muted-foreground/80">
                  act. {formatDate(lastUploadAt)}
                </span>
              </p>
            )}
          </div>
        </div>

        <CatalogClient
          key={`${params.q ?? ""}|${params.categoria ?? ""}`}
          products={products.filter((p) => !p.disabled)}
          initialCategory={params.categoria ?? null}
          initialQuery={params.q ?? null}
        />
      </main>

      <SiteFooter />
    </>
  );
}
