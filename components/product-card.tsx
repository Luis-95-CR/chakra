"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { categoryIcon } from "@/lib/categories";
import { formatPrice, roundGrams } from "@/lib/format";
import { PRICE_FIELDS, type PriceFieldKey, type Product } from "@/lib/types";
import { useCart, useCartUI } from "@/lib/cart-context";
import { cn } from "@/lib/utils";


export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const { openCart } = useCartUI();

  // Available presentations for this product
  const available = PRICE_FIELDS.filter((f) => product[f.key] != null);
  const [selectedKey, setSelectedKey] = useState<PriceFieldKey>(
    available[0]?.key ?? "priceBulk",
  );
  const [granelGrams, setGranelGrams] = useState("1000");
  const [justAdded, setJustAdded] = useState(false);

  const selectedPrice = product[selectedKey];
  const rawGrams = parseInt(granelGrams, 10);
  const parsedGrams = rawGrams > 0 ? Math.min(1_000_000, roundGrams(rawGrams)) : 0;
  const displayPrice =
    selectedKey === "priceBulk" && selectedPrice != null && parsedGrams > 0
      ? selectedPrice * (parsedGrams / 1000)
      : selectedPrice;
  const granelInvalid = selectedKey === "priceBulk" && !(parsedGrams > 0);
  const Icon = categoryIcon(product.category);

  const cartQty = useMemo(
    () => items
      .filter((i) => i.productId === product.id && i.status === "ok")
      .reduce((sum, i) => sum + i.quantity, 0),
    [items, product.id],
  );

  useEffect(() => {
    if (!justAdded) return;
    const id = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(id);
  }, [justAdded]);

  function handleAdd() {
    if (!selectedPrice || granelInvalid) return;
    const grams = selectedKey === "priceBulk" ? parsedGrams : undefined;
    addItem(product.id, product.name, selectedKey, grams);
    openCart();
    setJustAdded(true);
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-premium">
      
      {/* Accent bar */}
      <div className="h-1 w-full bg-linear-to-r from-primary via-primary/70 to-primary/30" />
  
      {cartQty > 0 && (
        <span className="absolute right-4 top-4 z-10 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground shadow-sm">
          {cartQty}
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {product.category || "Carnicería"}
          </p>
          <h3 className="mt-0.5 font-display text-lg font-semibold leading-snug tracking-tight line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2" title={product.description}>
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Price breakdown — solo muestra presentaciones con precio */}
      {available.length > 0 && (
        <div className="px-5 pb-3">
          <dl
            className={cn(
              "grid gap-1.5 border-t pt-3",
              available.length === 1 ? "grid-cols-1" :
              available.length === 2 ? "grid-cols-2" :
              available.length === 4 ? "grid-cols-4" : "grid-cols-3",
            )}
          >
            {available.map((f) => (
              <div key={f.key} className="rounded-lg bg-muted/60 px-2 py-2 text-center">
                <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums">
                  {formatPrice(product[f.key])}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}


      {/* Presentation selector */}
      <div className="mt-auto space-y-3 border-t border-dashed px-5 pt-4">
        {available.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-1.5">
              {available.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setSelectedKey(f.key)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                    selectedKey === f.key
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {available.some((f) => f.key === "priceBulk") && (
              <div className={cn("flex items-center gap-2", selectedKey !== "priceBulk" && "invisible")}>
                <span className="text-xs font-medium text-muted-foreground">Cantidad</span>
                <input
                  type="number"
                  min="100"
                  max="1000000"
                  step="100"
                  value={granelGrams}
                  onChange={(e) => setGranelGrams(e.target.value)}
                  onBlur={(e) => {
                    const g = parseInt(e.target.value, 10);
                    if (g > 0) setGranelGrams(String(Math.min(1_000_000, roundGrams(g))));
                  }}
                  className="w-24 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="0"
                />
                <span className="text-sm text-muted-foreground">g</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Price + Add — the price is the hero */}
      <div className="mt-3 flex items-end justify-between gap-3 px-5 pb-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Precio
          </p>
          {displayPrice != null ? (
            <p className="font-display text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums">
              {formatPrice(displayPrice)}
            </p>
          ) : (
            <p className="font-display text-lg italic text-muted-foreground">Sin precio</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedPrice || granelInvalid}
          className={cn(
            "relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
            justAdded
              ? "bg-emerald-600 text-white"
              : "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-premium",
          )}
        >
          {justAdded ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
          {justAdded ? "¡Listo!" : "Agregar"}
        </button>
      </div>
    </article>
  );
});
