import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CatalogClient } from "./catalog-client";
import { getCatalog, getSettings } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/config";

// Always render fresh so a new upload shows up immediately.
export const dynamic = "force-dynamic";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
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
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
                {siteConfig.name}
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {settings.tagline ?? siteConfig.tagline}
              </h1>
            </div>
            {products.length > 0 && (
              <p className="text-sm text-muted-foreground sm:text-right">
                {products.length} productos ·{" "}
                <span className="text-muted-foreground/70">
                  act. {formatDate(lastUploadAt)}
                </span>
              </p>
            )}
          </div>
        </div>

        <CatalogClient
          products={products}
          initialCategory={params.categoria ?? null}
        />
      </main>

      <SiteFooter />
    </>
  );
}
