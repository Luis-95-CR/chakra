import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { Catalog, SiteSettings } from "./types";

// The whole catalog lives under a single key, since uploads replace it wholesale.
const CATALOG_KEY = "catalog";

const EMPTY_CATALOG: Catalog = {
  products: [],
  lastUploadAt: new Date(0).toISOString(),
};

// Use Upstash when configured; otherwise fall back to a local JSON file so the
// app runs with zero setup during development.
const useRedis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = useRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const localFile = path.join(process.cwd(), ".data", "catalog.json");

async function readLocal(): Promise<Catalog> {
  try {
    const raw = await fs.readFile(localFile, "utf8");
    return JSON.parse(raw) as Catalog;
  } catch {
    return EMPTY_CATALOG;
  }
}

async function writeLocal(catalog: Catalog): Promise<void> {
  await fs.mkdir(path.dirname(localFile), { recursive: true });
  await fs.writeFile(localFile, JSON.stringify(catalog, null, 2), "utf8");
}

/** Reads the current catalog. Never throws: returns an empty catalog instead. */
export const getCatalog = cache(unstable_cache(
  async (): Promise<Catalog> => {
    if (redis) {
      const data = await redis.get<Catalog>(CATALOG_KEY);
      return data ?? EMPTY_CATALOG;
    }
    return readLocal();
  },
  ["catalog"],
  { tags: ["catalog"] },
));

/** Updates a single product by id. Returns false if not found. */
export async function updateProduct(id: string, patch: Partial<import("./types").Product>): Promise<boolean> {
  const catalog: Catalog = await getCatalog();
  const idx = catalog.products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  const products = [...catalog.products];
  products[idx] = { ...products[idx], ...patch, id };
  await saveCatalog({ ...catalog, products, lastUploadAt: new Date().toISOString() });
  return true;
}

/** Deletes a product by id. Returns false if not found. */
export async function deleteProduct(id: string): Promise<boolean> {
  const catalog: Catalog = await getCatalog();
  const idx = catalog.products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  const products = catalog.products.filter((_, i) => i !== idx);
  await saveCatalog({ ...catalog, products, lastUploadAt: new Date().toISOString() });
  return true;
}

/** Appends a new product to the catalog. */
export async function addProduct(product: import("./types").Product): Promise<void> {
  const catalog: Catalog = await getCatalog();
  await saveCatalog({ ...catalog, products: [...catalog.products, product], lastUploadAt: new Date().toISOString() });
}

/** Replaces the entire catalog with a new set of products. */
export async function saveCatalog(catalog: Catalog): Promise<void> {
  if (redis) {
    await redis.set(CATALOG_KEY, catalog);
    return;
  }
  await writeLocal(catalog);
}

// ── Site settings ────────────────────────────────────────────────────────────

const SETTINGS_KEY = "settings";
const settingsFile = path.join(process.cwd(), ".data", "settings.json");

/** Reads the current site settings. Never throws: returns empty object instead. */
export const getSettings = cache(unstable_cache(
  async (): Promise<SiteSettings> => {
    if (redis) {
      const data = await redis.get<SiteSettings>(SETTINGS_KEY);
      return data ?? {};
    }
    try {
      const raw = await fs.readFile(settingsFile, "utf8");
      return JSON.parse(raw) as SiteSettings;
    } catch {
      return {};
    }
  },
  ["settings"],
  { tags: ["settings"] },
));

/** Persists site settings. */
export async function saveSettings(settings: SiteSettings): Promise<void> {
  if (redis) {
    await redis.set(SETTINGS_KEY, settings);
    return;
  }
  await fs.mkdir(path.dirname(settingsFile), { recursive: true });
  await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2), "utf8");
}
