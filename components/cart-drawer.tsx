"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useCart, useCartUI, type ResolvedItem } from "@/lib/cart-context";
import { PRICE_FIELDS } from "@/lib/types";
import { categoryIcon } from "@/lib/categories";
import { formatGrams, formatPrice, roundGrams } from "@/lib/format";

function GranelInput({ initialGrams, onUpdate }: { initialGrams?: number; onUpdate: (g: number) => void }) {
  const [value, setValue] = useState(String(initialGrams ?? ""));
  const [prevGrams, setPrevGrams] = useState(initialGrams);
  const [isFocused, setIsFocused] = useState(false);

  // Sync when prop changes externally (e.g. re-added from product card), but not while typing.
  if (prevGrams !== initialGrams && !isFocused) {
    setPrevGrams(initialGrams);
    setValue(String(initialGrams ?? ""));
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min="100"
        max="1000000"
        step="100"
        value={value}
        onFocus={() => setIsFocused(true)}
        onChange={(e) => {
          setValue(e.target.value);
          const g = parseInt(e.target.value, 10);
          if (g > 0) onUpdate(Math.min(1_000_000, g));
        }}
        onBlur={(e) => {
          setIsFocused(false);
          const g = parseInt(e.target.value, 10);
          const rounded = g > 0 ? Math.min(1_000_000, roundGrams(g)) : (initialGrams ?? 100);
          setValue(String(rounded));
          onUpdate(rounded);
        }}
        className="w-24 rounded-lg border bg-muted/40 px-2 py-1.5 text-sm text-center tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <span className="text-xs text-muted-foreground">g</span>
    </div>
  );
}

export function CartDrawer() {
  const { items, totalOk, okCount, removeItem, updateQuantity, updateGrams, clearCart, clearProblems, sendToWhatsApp } =
    useCart();
  const { isOpen, closeCart, setPendingSearch } = useCartUI();
  const router = useRouter();

  function goToProduct(name: string) {
    setPendingSearch(name);
    closeCart();
    router.push("/productos");
  }

  const okItems = useMemo(
    () => items.filter((i): i is Extract<ResolvedItem, { status: "ok" }> => i.status === "ok"),
    [items],
  );
  const problemItems = useMemo(() => items.filter((i) => i.status !== "ok"), [items]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de pedido"
        className={`fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm flex-col border-l border-border bg-background shadow-premium-lg transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
              <ShoppingCart className="size-4.5" />
            </span>
            <h2 className="font-display text-xl font-semibold tracking-tight">Tu pedido</h2>
            {okCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold tabular-nums text-primary-foreground">
                {okCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Vaciar
              </button>
            )}
            <button
              type="button"
              onClick={closeCart}
              aria-label="Cerrar carrito"
              className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground/60">
                <ShoppingCart className="size-7" />
              </span>
              <p className="mt-1 font-display text-lg font-semibold tracking-tight">Tu carrito está vacío</p>
              <p className="max-w-56 text-sm text-muted-foreground">
                Seleccioná los productos que querés pedir
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {okItems.map((item) => {
                const isBulk = item.priceKey === "priceBulk";
                const label = isBulk
                  ? `Granel${item.grams ? ` · ${formatGrams(item.grams)}` : ""}`
                  : PRICE_FIELDS.find((f) => f.key === item.priceKey)?.label ?? item.priceKey;
                const Icon = categoryIcon(item.product.category);
                return (
                  <div
                    key={`${item.productId}-${item.priceKey}`}
                    className="rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-premium"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => goToProduct(item.product.name)}
                          className="text-left text-sm font-semibold leading-snug line-clamp-2 hover:underline underline-offset-2"
                        >
                          {item.product.name}
                        </button>
                        <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.priceKey)}
                        aria-label="Eliminar"
                        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-dashed pt-3">
                      {isBulk ? (
                        <GranelInput
                          initialGrams={item.grams}
                          onUpdate={(g) => updateGrams(item.productId, item.priceKey, g)}
                        />
                      ) : (
                        <div className="flex items-center gap-1 rounded-lg border bg-muted/40">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.priceKey, item.quantity - 1)}
                            aria-label="Restar"
                            className="flex size-7 items-center justify-center rounded-l-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.priceKey, item.quantity + 1)}
                            aria-label="Sumar"
                            className="flex size-7 items-center justify-center rounded-r-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      )}
                      <p className="font-display text-base font-semibold tabular-nums text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Problem items */}
              {problemItems.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Requieren atención
                    </p>
                    <button
                      type="button"
                      onClick={clearProblems}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Eliminar todos
                    </button>
                  </div>
                  {problemItems.map((item) => {
                    const label = PRICE_FIELDS.find((f) => f.key === item.priceKey)?.label ?? item.priceKey;
                    const name = item.name;
                    const badge =
                      item.status === "removed"
                        ? { text: "No disponible", cls: "bg-destructive/10 text-destructive" }
                        : { text: "Precio no disponible", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
                    return (
                      <div
                        key={`${item.productId}-${item.priceKey}`}
                        className="flex items-start justify-between gap-2 rounded-xl border border-dashed p-3 opacity-70"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-medium text-muted-foreground line-clamp-1">{name}</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                              {label}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.cls}`}>
                              {badge.text}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.priceKey)}
                          aria-label="Eliminar"
                          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-muted/40 px-5 py-4 space-y-3">
            {okItems.length > 0 && (
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total estimado</span>
                <span className="font-display text-2xl font-semibold tabular-nums">
                  {formatPrice(totalOk)}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={sendToWhatsApp}
              disabled={okItems.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-premium disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
            >
              <FaWhatsapp className="size-5" />
              Pedir por WhatsApp
            </button>
            {problemItems.length > 0 && okItems.length > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                Los productos que requieren atención no se incluirán
              </p>
            )}
            {okItems.length === 0 && (
              <p className="text-center text-xs text-muted-foreground">
                Ningún producto está disponible para pedir
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
