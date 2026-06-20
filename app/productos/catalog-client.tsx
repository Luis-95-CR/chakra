"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, PackageOpen, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product-card";
import { categoryIcon } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { useCartUI } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

const ALL = "__all__";

export function CatalogClient({
  products,
  initialCategory,
  initialQuery,
}: {
  products: Product[];
  initialCategory: string | null;
  initialQuery?: string | null;
}) {
  const router = useRouter();
  const { pendingSearch, setPendingSearch } = useCartUI();

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [products]);

  const [query, setQuery] = useState(initialQuery ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [category, setCategory] = useState<string>(
    initialCategory && categories.includes(initialCategory)
      ? initialCategory
      : ALL,
  );

  useEffect(() => {
    if (!pendingSearch) return;
    setQuery(pendingSearch);
    setDebouncedQuery(pendingSearch);
    setPendingSearch(null);
  }, [pendingSearch, setPendingSearch]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(id);
  }, [query]);

  const q = debouncedQuery.trim().toLowerCase();
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
      {/* Toolbar — on mobile the wrapper is `display:contents` so it adds no
          box of its own; that makes the search's sticky containing block the
          tall root (it stays pinned through the whole list) while the chips
          scroll away. On sm+ it becomes a normal sticky card holding both. */}
      <div className="contents space-y-4 sm:block sm:sticky sm:top-21.25 sm:z-10 sm:rounded-2xl sm:border sm:bg-background/85 sm:px-5 sm:py-4 sm:shadow-premium sm:backdrop-blur-xl">
        <div className="sticky top-16.25 z-20 -mx-4 border-b bg-background/85 px-4 py-4 backdrop-blur-xl sm:static sm:z-auto sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar producto…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 rounded-xl pl-10 text-base"
              aria-label="Buscar producto"
            />
          </div>
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
              setDebouncedQuery("");
              setCategory(ALL);
              router.replace("/productos", { scroll: false });
            }}
            className="cursor-pointer inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
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
              <section key={name} className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
                    <Icon className="size-5" />
                  </span>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    {name}
                  </h2>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                    {items.length}
                  </span>
                  <span aria-hidden className="ml-1 hidden h-px flex-1 rule-gold opacity-40 sm:block" />
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both duration-500 h-full"
          style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
        >
          <ProductCard product={product} />
        </div>
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
        "cursor-pointer inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ hasProducts }: { hasProducts: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/50 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
        <PackageOpen className="size-8" />
      </span>
      <p className="mt-1 font-display text-xl font-semibold tracking-tight">
        {hasProducts
          ? "Sin coincidencias"
          : "Aún no hay productos cargados"}
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        {hasProducts
          ? "Probá con otro término o quitá los filtros."
          : "El administrador puede cargar la lista de precios desde un Excel."}
      </p>
    </div>
  );
}
