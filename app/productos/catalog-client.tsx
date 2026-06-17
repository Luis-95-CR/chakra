"use client";

import { useMemo, useState } from "react";
import { Search, PackageOpen, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product-card";
import { categoryIcon } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

const ALL = "__all__";

export function CatalogClient({
  products,
  initialCategory,
}: {
  products: Product[];
  initialCategory: string | null;
}) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [products]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(
    initialCategory && categories.includes(initialCategory)
      ? initialCategory
      : ALL,
  );

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    return products.filter((p) => {
      if (category !== ALL && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, q, category]);

  // Group by category for the default (unfiltered) view.
  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of matches) {
      const key = p.category || "Otros";
      const list = map.get(key);
      if (list) list.push(p);
      else map.set(key, [p]);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "es"),
    );
  }, [matches]);

  const showGrouped = category === ALL && !q;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="sticky top-16 z-10 -mx-4 space-y-4 border-b bg-background/90 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar producto…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 pl-9"
            aria-label="Buscar producto"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Chip label="Todos" active={category === ALL} onClick={() => setCategory(ALL)} />
            {categories.map((c) => {
              const Icon = categoryIcon(c);
              return (
                <Chip
                  key={c}
                  label={c}
                  icon={<Icon className="size-3.5" />}
                  active={category === c}
                  onClick={() => setCategory(c)}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {matches.length} {matches.length === 1 ? "producto" : "productos"}
        </p>
        {(q || category !== ALL) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory(ALL);
            }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {matches.length === 0 ? (
        <EmptyState hasProducts={products.length > 0} />
      ) : showGrouped ? (
        <div className="space-y-10">
          {grouped.map(([name, items]) => {
            const Icon = categoryIcon(name);
            return (
              <section key={name} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <h2 className="font-display text-xl font-semibold tracking-tight">
                    {name}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    ({items.length})
                  </span>
                </div>
                <ProductGrid products={items} />
              </section>
            );
          })}
        </div>
      ) : (
        <ProductGrid products={matches} />
      )}
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function Chip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ hasProducts }: { hasProducts: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
      <PackageOpen className="size-10 text-muted-foreground" />
      <p className="text-base font-medium">
        {hasProducts
          ? "No hay productos que coincidan con tu búsqueda."
          : "Aún no hay productos cargados."}
      </p>
      {!hasProducts && (
        <p className="text-sm text-muted-foreground">
          El administrador puede cargar la lista de precios desde un Excel.
        </p>
      )}
    </div>
  );
}
