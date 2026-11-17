import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/catalog';
import { news } from '@/data/news';
import { site } from '@/data/site';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { products, categories } = await getCatalog();
  const fixed = ['', '/vehicles', '/compare', '/dealers', '/dealership', '/services', '/services/book', '/company', '/finance', '/our-teams', '/news', '/contact', '/privacy-policy', '/terms', '/cookie-policy'];
  return [
    ...fixed.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: 'monthly' as const, priority: p === '' ? 1 : 0.7 })),
    ...categories.map((c) => ({ url: `${base}/vehicles/${c.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/vehicles/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...news.map((n) => ({ url: `${base}/news/${n.slug}`, lastModified: new Date(n.date), priority: 0.5 })),
  ];
}
