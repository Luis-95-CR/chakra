"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PRICE_FIELDS, type CartItem, type PriceFieldKey, type Product } from "./types";
import { formatGrams, formatPrice } from "./format";
import { siteConfig } from "./config";

// ── Resolved item ────────────────────────────────────────────────────────────

export type ResolvedItem =
  | { status: "ok"; productId: string; name: string; priceKey: PriceFieldKey; quantity: number; grams?: number; product: Product; price: number }
  | { status: "price-unavailable"; productId: string; name: string; priceKey: PriceFieldKey; quantity: number; grams?: number; product: Product }
  | { status: "removed"; productId: string; name: string; priceKey: PriceFieldKey; quantity: number; grams?: number };

function resolve(items: CartItem[], products: Product[]): ResolvedItem[] {
  return items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { ...item, status: "removed" as const };
    const rawPrice = product[item.priceKey];
    if (rawPrice == null) return { ...item, product, status: "price-unavailable" as const };
    const price =
      item.priceKey === "priceBulk" && item.grams != null
        ? rawPrice * (item.grams / 1000)
        : rawPrice;
    return { ...item, product, price, status: "ok" as const };
  });
}

// ── Reducer ──────────────────────────────────────────────────────────────────

type State = { raw: CartItem[]; isOpen: boolean };
type Action =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD"; productId: string; name: string; priceKey: PriceFieldKey; grams?: number }
  | { type: "REMOVE"; productId: string; priceKey: PriceFieldKey }
  | { type: "UPDATE_QTY"; productId: string; priceKey: PriceFieldKey; qty: number }
  | { type: "UPDATE_GRAMS"; productId: string; priceKey: PriceFieldKey; grams: number }
  | { type: "CLEAR" }
  | { type: "OPEN" }
  | { type: "CLOSE" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, raw: action.items };
    case "ADD": {
      const idx = state.raw.findIndex(
        (i) => i.productId === action.productId && i.priceKey === action.priceKey,
      );
      if (idx >= 0) {
        const raw = [...state.raw];
        raw[idx] = action.grams != null
          ? { ...raw[idx], grams: action.grams }
          : { ...raw[idx], quantity: raw[idx].quantity + 1 };
        return { ...state, raw };
      }
      return {
        ...state,
        raw: [...state.raw, { productId: action.productId, name: action.name, priceKey: action.priceKey, quantity: 1, grams: action.grams }],
      };
    }
    case "UPDATE_GRAMS":
      return {
        ...state,
        raw: state.raw.map((i) =>
          i.productId === action.productId && i.priceKey === action.priceKey
            ? { ...i, grams: action.grams }
            : i,
        ),
      };
    case "REMOVE":
      return {
        ...state,
        raw: state.raw.filter(
          (i) => !(i.productId === action.productId && i.priceKey === action.priceKey),
        ),
      };
    case "UPDATE_QTY": {
      if (action.qty <= 0) {
        return {
          ...state,
          raw: state.raw.filter(
            (i) => !(i.productId === action.productId && i.priceKey === action.priceKey),
          ),
        };
      }
      return {
        ...state,
        raw: state.raw.map((i) =>
          i.productId === action.productId && i.priceKey === action.priceKey
            ? { ...i, quantity: action.qty }
            : i,
        ),
      };
    }
    case "CLEAR":
      return { ...state, raw: [] };
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

type CartCtx = {
  items: ResolvedItem[];
  totalOk: number;
  okCount: number;
  addItem: (productId: string, name: string, priceKey: PriceFieldKey, grams?: number) => void;
  removeItem: (productId: string, priceKey: PriceFieldKey) => void;
  updateQuantity: (productId: string, priceKey: PriceFieldKey, qty: number) => void;
  updateGrams: (productId: string, priceKey: PriceFieldKey, grams: number) => void;
  clearCart: () => void;
  clearProblems: () => void;
  sendToWhatsApp: () => void;
};

// Separate context for drawer open/close so ProductCards don't re-render on toggle.
type CartUICtx = {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  pendingSearch: string | null;
  setPendingSearch: (v: string | null) => void;
};

const CartContext = createContext<CartCtx | null>(null);
const CartUIContext = createContext<CartUICtx | null>(null);

const STORAGE_KEY = "chakra-cart";

// ── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({
  products,
  waPhone,
  children,
}: {
  products: Product[];
  waPhone: string;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, { raw: [], isOpen: false });
  const [pendingSearch, setPendingSearch] = useState<string | null>(null);
  const hydrated = useRef(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        if (Array.isArray(parsed)) dispatch({ type: "HYDRATE", items: parsed });
      }
    } catch {
      // ignore corrupt data
    }
    hydrated.current = true;
  }, []);

  // Persist raw items (no prices) on every change after hydration
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.raw));
    } catch {
      // ignore storage errors
    }
  }, [state.raw]);

  const items = useMemo(() => resolve(state.raw, products), [state.raw, products]);
  const okItems = useMemo(
    () => items.filter((i): i is Extract<ResolvedItem, { status: "ok" }> => i.status === "ok"),
    [items],
  );
  const totalOk = useMemo(() => okItems.reduce((sum, i) => sum + i.price * i.quantity, 0), [okItems]);
  const okCount = useMemo(() => okItems.reduce((sum, i) => sum + i.quantity, 0), [okItems]);

  // dispatch from useReducer is stable — these callbacks never need to be recreated.
  const openCart      = useCallback(() => dispatch({ type: "OPEN" }),  []);
  const closeCart     = useCallback(() => dispatch({ type: "CLOSE" }), []);
  const addItem       = useCallback((productId: string, name: string, priceKey: PriceFieldKey, grams?: number) =>
    dispatch({ type: "ADD", productId, name, priceKey, grams }), []);
  const removeItem    = useCallback((productId: string, priceKey: PriceFieldKey) =>
    dispatch({ type: "REMOVE", productId, priceKey }), []);
  const updateQuantity = useCallback((productId: string, priceKey: PriceFieldKey, qty: number) =>
    dispatch({ type: "UPDATE_QTY", productId, priceKey, qty }), []);
  const updateGrams   = useCallback((productId: string, priceKey: PriceFieldKey, grams: number) =>
    dispatch({ type: "UPDATE_GRAMS", productId, priceKey, grams }), []);
  const clearCart     = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const clearProblems = useCallback(() => {
    const problemIds = new Set(
      items.filter((i) => i.status !== "ok").map((i) => `${i.productId}|${i.priceKey}`),
    );
    dispatch({
      type: "HYDRATE",
      items: state.raw.filter((i) => !problemIds.has(`${i.productId}|${i.priceKey}`)),
    });
  }, [items, state.raw]);

  const sendToWhatsApp = useCallback(() => {
    if (!waPhone || okItems.length === 0) return;
    const lines = okItems.map((i) => {
      if (i.priceKey === "priceBulk") {
        const weight = i.grams ? ` · ${formatGrams(i.grams)}` : "";
        return `• ${i.product.name} (Granel${weight}) — ${formatPrice(i.price)}`;
      }
      const label = PRICE_FIELDS.find((f) => f.key === i.priceKey)?.label ?? i.priceKey;
      return `• ${i.product.name} (${label}) x${i.quantity} — ${formatPrice(i.price * i.quantity)}`;
    });
    const message = [
      `Hola! Quisiera hacer el siguiente pedido de ${siteConfig.name}:`,
      "",
      ...lines,
      "",
      `Total estimado: ${formatPrice(totalOk)}`,
      "",
      "Precios de referencia, sujetos a confirmación.",
    ].join("\n");
    const clean = waPhone.replace(/\D/g, "");
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, "_blank");
  }, [waPhone, okItems, totalOk]);

  const ctx = useMemo(
    () => ({
      items, totalOk, okCount,
      addItem, removeItem,
      updateQuantity, updateGrams, clearCart,
      clearProblems, sendToWhatsApp,
    }),
    [items, totalOk, okCount,
     addItem, removeItem,
     updateQuantity, updateGrams, clearCart,
     clearProblems, sendToWhatsApp],
  );

  const uiCtx = useMemo(
    () => ({ isOpen: state.isOpen, openCart, closeCart, pendingSearch, setPendingSearch }),
    [state.isOpen, openCart, closeCart, pendingSearch],
  );

  return (
    <CartContext.Provider value={ctx}>
      <CartUIContext.Provider value={uiCtx}>
        {children}
      </CartUIContext.Provider>
    </CartContext.Provider>
  );
}

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function useCartUI(): CartUICtx {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error("useCartUI must be used inside CartProvider");
  return ctx;
}
