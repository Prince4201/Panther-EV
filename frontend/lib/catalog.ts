import { cache } from 'react';
import type { Catalog, Category, Product } from '@/types/product';
import { categories as fallbackCategories, products as fallbackProducts } from '@/data/products';
import { API_URL } from './api';
import { cached } from './cache';
import { NO_IMAGE } from './media';

interface ApiProduct { slug: string; name: string; category: string; tag?: string; summary?: string; description?: string; image?: string; price?: number | null; specs?: Array<{ label: string; value: string | null }> }
interface ApiCategory { key: string; slug: string; name: string; description?: string; active: boolean }

export const fallbackCatalog: Catalog = { products: fallbackProducts, categories: fallbackCategories };

const toProduct = (p: ApiProduct): Product => ({
  slug: p.slug, name: p.name, category: p.category, tag: p.tag ?? '', summary: p.summary ?? '', description: p.description ?? '',
  image: p.image || NO_IMAGE, price: p.price ?? null, specs: (p.specs ?? []).filter((s) => s.label),
});
const toCategory = (c: ApiCategory): Category => ({ key: c.key, slug: c.slug, title: c.name, intro: c.description ?? '', active: c.active });

/**
 * Server-side: vehicles and vehicle categories from MongoDB (Admin > Vehicles). Refreshed the moment an admin saves
 * (tag "catalog"). Falls back to the built-in copy if the API is down or has no vehicles yet.
 */
export const getCatalog = cache(async (): Promise<Catalog> => {
  try {
    const res = await fetch(`${API_URL}/catalog`, cached('catalog'));
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { products?: ApiProduct[]; categories?: ApiCategory[] };
    const products = (data.products ?? []).map(toProduct);
    const categories = (data.categories ?? []).map(toCategory);
    if (!products.length || !categories.length) return fallbackCatalog;
    return { products, categories };
  } catch { return fallbackCatalog; }
});

// Helpers shared by server pages and the client catalog context.
export const categoryTitle = (c: Catalog, key: string) => c.categories.find((x) => x.key === key)?.title ?? '';
export const activeCategories = (c: Catalog) => c.categories.filter((x) => x.active);
