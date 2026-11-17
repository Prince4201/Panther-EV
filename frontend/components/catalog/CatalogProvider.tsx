'use client';
import { createContext, useContext, useMemo } from 'react';
import type { Catalog, Category, Product } from '@/types/product';
import { categories as fallbackCategories, products as fallbackProducts } from '@/data/products';

interface Ctx {
  products: Product[];
  /** Every category, including deactivated ones (for labels). */
  allCategories: Category[];
  /** Active categories, in display order: what menus, tabs and filters show. */
  categories: Category[];
  /** Category name for a vehicle's category key. */
  label: (key: string) => string;
  getProduct: (slug: string) => Product | undefined;
}

const build = (c: Catalog): Ctx => ({
  products: c.products,
  allCategories: c.categories,
  categories: c.categories.filter((x) => x.active),
  label: (key) => c.categories.find((x) => x.key === key)?.title ?? '',
  getProduct: (slug) => c.products.find((p) => p.slug === slug),
});

const CatalogContext = createContext<Ctx>(build({ products: fallbackProducts, categories: fallbackCategories }));

/** Vehicles + categories for client components (menus, search, showcase, compare). The server fetches them once per page. */
export function CatalogProvider({ catalog, children }: { catalog?: Catalog; children: React.ReactNode }) {
  const value = useMemo(() => build(catalog ?? { products: fallbackProducts, categories: fallbackCategories }), [catalog]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
export const useCatalog = () => useContext(CatalogContext);
