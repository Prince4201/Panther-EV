import type { Category, Product, Spec } from '@/types/product';

// Fallback copy of the vehicles (see the note on `categories` below).
// pantherev.com publishes no specifications, so every value is null until Panther supplies them.
const unpublished = (): Spec[] =>
  ['Range', 'Battery', 'Motor', 'Payload', 'Charging', 'Warranty'].map((label) => ({ label, value: null }));

const img = (file: string) => `/vehicles/${file}.png`;

export const products: Product[] = [
  { slug: 'panther-xl-plus', summary: 'Heavy-duty passenger e-rickshaw, the top of the XL line.', name: 'Panther XL Plus', category: 'passenger', tag: 'Heavy Duty', image: img('panther-xl-plus'), specs: unpublished() },
  { slug: 'panther-xl', summary: 'Popular passenger e-rickshaw built for daily city routes.', name: 'Panther XL', category: 'passenger', tag: 'Popular', image: img('panther-xl'), specs: unpublished() },
  { slug: 'panther-deluxe', summary: 'Comfort-focused passenger e-rickshaw with low-maintenance design.', name: 'Panther Deluxe', category: 'passenger', tag: 'Comfort', image: img('panther-deluxe'), specs: unpublished() },
  { slug: 'panther-super-deluxe', summary: 'Flagship passenger e-rickshaw in the Panther range.', name: 'Panther Super Deluxe', category: 'passenger', tag: 'Flagship', image: img('panther-super-deluxe'), specs: unpublished() },
  { slug: 'panther-xl-cargo', summary: 'Cargo e-rickshaw for logistics and last-mile delivery.', name: 'Panther XL Cargo', category: 'cargo', tag: 'Logistics', image: img('panther-xl-cargo'), specs: unpublished() },
  { slug: 'panther-cargo', summary: 'Heavy-duty cargo e-rickshaw built for maximum payload.', name: 'Panther Cargo', category: 'cargo', tag: 'Max Payload', image: img('panther-cargo'), specs: unpublished() },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const SPEC_FALLBACK = 'Contact Panther for details';

// Fallback only. The live list of categories and vehicles comes from the database (lib/catalog.ts);
// these are shown when the API cannot be reached, so the site is never empty.
export const categories: Category[] = [
  { slug: 'passenger-e-rickshaw', key: 'passenger', title: 'Passenger e-rickshaw', intro: 'Comfortable, dependable electric rickshaws for people-moving businesses.', active: true },
  { slug: 'cargo-e-rickshaw', key: 'cargo', title: 'Cargo e-rickshaw', intro: 'Heavy-duty electric rickshaws for logistics and last-mile delivery.', active: true },
];

// Statements Panther publishes about its range as a whole (not model-specific). Model-level specs come from the CMS later.
export const rangeFeatures = [
  { title: 'Heavy-duty chassis', body: 'Built for any terrain or heavy load.' },
  { title: 'Advanced suspension', body: 'Designed for the toughest Indian roads.' },
  { title: 'High-density Li-Ion technology', body: 'Introduced in 2022 for longer battery life cycles.' },
  { title: 'Low maintenance', body: 'Designed to minimise service needs and costs, so the vehicle stays on the road longer.' },
  { title: 'Optimised efficiency', body: 'Tuned for maximum range and profitability.' },
];
