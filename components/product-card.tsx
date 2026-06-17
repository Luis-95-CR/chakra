import { categoryIcon } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { PRICE_FIELDS, type Product } from "@/lib/types";

const KILO_FIELDS = PRICE_FIELDS.filter((f) => f.key !== "priceBulk");

export function ProductCard({ product }: { product: Product }) {
  let featured: { label: string; value: number } | null = null;
  if (product.priceBulk != null) {
    featured = { label: "Granel", value: product.priceBulk };
  } else {
    const first = PRICE_FIELDS.find((f) => product[f.key] != null);
    if (first) featured = { label: first.label, value: product[first.key]! };
  }

  const Icon = categoryIcon(product.category);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5">

      {/* Accent bar */}
      <div className="h-1 w-full bg-linear-to-r from-primary via-primary/70 to-primary/30" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="min-w-0 space-y-1">
          <h3 className="font-display text-base font-semibold leading-snug tracking-tight sm:text-lg line-clamp-2 min-h-11 sm:min-h-[3.1rem]">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2" title={product.description}>
              {product.description}
            </p>
          )}
        </div>
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary/70 transition-colors duration-300 group-hover:bg-primary/15 group-hover:text-primary">
          <Icon className="size-4" />
        </span>
      </div>

      {/* Price */}
      <div className="mt-auto px-5 pb-5">
        {featured ? (
          <div className="mb-3 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-semibold tabular-nums text-foreground">
              {formatPrice(featured.value)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              / {featured.label}
            </span>
          </div>
        ) : (
          <p className="mb-3 text-sm text-muted-foreground italic">Precio no disponible</p>
        )}

        {/* Breakdown */}
        <dl className="grid grid-cols-3 gap-1.5 border-t pt-3">
          {KILO_FIELDS.map((f) => {
            const val = product[f.key];
            return (
              <div key={f.key} className="rounded-lg bg-muted/60 px-2 py-2 text-center">
                <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums">
                  {val != null ? formatPrice(val) : (
                    <span className="text-muted-foreground/50 text-xs">—</span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </article>
  );
}
