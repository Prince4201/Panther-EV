/** The key of a vehicle category. Categories are created in Admin > Vehicles, so this is any string, not a fixed list. */
export type ProductCategory = string;

/** A spec with value === null renders as "Contact Panther for details". */
export interface Spec {
  label: string;
  value: string | null;
}

export interface Product {
  slug: string;
  name: string;
  category: ProductCategory;
  /** The model tag shown on pantherev.com (e.g. "Heavy Duty"). */
  tag: string;
  image: string;
  /** One honest sentence. Only claims Panther already makes publicly. */
  summary: string;
  specs: Spec[];
  description?: string;
  /** null / undefined = "Contact Panther for the latest price". */
  price?: number | null;
}

export interface Category {
  /** What a vehicle stores in `category`. Never changes. */
  key: ProductCategory;
  /** Public address: /vehicles/<slug>. */
  slug: string;
  title: string;
  intro: string;
  /** Inactive categories are left out of menus and tabs; their vehicles still show and keep the label. */
  active: boolean;
}

export interface Catalog { products: Product[]; categories: Category[] }
