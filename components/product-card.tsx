import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { PRICE_FIELDS, type Product } from "@/lib/types";

// The three "by weight" presentations, always shown in a 3-column row.
const KILO_FIELDS = PRICE_FIELDS.filter((f) => f.key !== "priceBulk");

export function ProductCard({ product }: { product: Product }) {
  // Highlight the bulk ("Granel") price — the common one across products.
  // If a product has no bulk price, fall back to the first available one.
  let featured: { label: string; value: number } | null = null;
  if (product.priceBulk != null) {
    featured = { label: "Granel", value: product.priceBulk };
  } else {
    const first = PRICE_FIELDS.find((f) => product[f.key] != null);
    if (first) featured = { label: first.label, value: product[first.key]! };
  }

  return (
    <Card className="flex flex-col gap-0 overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="gap-1.5 px-5 pt-5 pb-3">
        {product.category && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {product.category}
          </span>
        )}
        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="mt-auto space-y-3 px-5 pb-5">
        {featured ? (
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-semibold tabular-nums text-foreground">
              {formatPrice(featured.value)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {featured.label}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Precio no disponible</p>
        )}

        <dl className="grid grid-cols-3 gap-2 border-t pt-3">
          {KILO_FIELDS.map((f) => (
            <div
              key={f.key}
              className="rounded-lg bg-muted/50 px-2 py-2 text-center"
            >
              <dt className="text-[11px] text-muted-foreground">{f.label}</dt>
              <dd className="text-sm font-semibold tabular-nums">
                {formatPrice(product[f.key])}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
