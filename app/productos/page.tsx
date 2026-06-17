import { SiteHeader } from "@/components/site-header";
import { CatalogClient } from "./catalog-client";
import { getCatalog } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/config";

// Always render fresh so a new upload shows up immediately.
export const dynamic = "force-dynamic";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const [{ products, lastUploadAt }, params] = await Promise.all([
    getCatalog(),
    searchParams,
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {siteConfig.tagline}
          </h1>
          {products.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Actualizado el {formatDate(lastUploadAt)}
            </p>
          )}
        </div>

        <CatalogClient
          products={products}
          initialCategory={params.categoria ?? null}
        />
      </main>

      <footer className="mt-auto border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}
      </footer>
    </>
  );
}
