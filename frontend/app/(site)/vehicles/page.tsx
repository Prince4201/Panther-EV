import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { VehicleBrowser } from '@/components/vehicles/VehicleBrowser';
import { activeCategories, getCatalog } from '@/lib/catalog';
import { isExternalImage } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Vehicles',
  description: 'Explore Panther passenger and cargo electric rickshaws, built for Indian roads and real-world business.',
  alternates: { canonical: '/vehicles' },
};

export default async function VehiclesPage() {
  const catalog = await getCatalog();
  const { products } = catalog;
  // Category tiles: every active category that has at least one vehicle.
  const tiles = activeCategories(catalog).map((c) => ({ c, list: products.filter((p) => p.category === c.key) })).filter((t) => t.list.length > 0);
  return (
    <>
      <PageHeader title="Our vehicles" intro="Electric vehicles from Panther. Choose a category or browse the full range." />
      <section aria-label="Categories" className="mx-auto grid max-w-page gap-5 px-5 pt-12 md:grid-cols-2 md:px-10">
        {tiles.map(({ c, list }) => (
          <Link key={c.slug} href={`/vehicles/${c.slug}`} className="group relative flex min-h-[260px] items-end justify-between gap-4 overflow-hidden bg-ink p-6 text-white md:p-8">
            <div className="relative z-10 max-w-[55%]">
              <h2 className="font-display text-4xl leading-none md:text-5xl">{c.title}</h2>
              {c.intro && <p className="mt-2 text-sm text-white/70">{c.intro}</p>}
              <span className="mt-4 inline-block border-b-2 border-panther-red pb-1 text-sm font-semibold uppercase tracking-wider">{list.length} {list.length === 1 ? 'model' : 'models'}</span>
            </div>
            <div className="absolute inset-y-0 right-0 w-1/2"><Image src={list[0].image} unoptimized={isExternalImage(list[0].image)} alt="" fill sizes="(min-width:768px) 25vw, 50vw" className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" /></div>
          </Link>
        ))}
      </section>
      <VehicleBrowser category="all" />
    </>
  );
}
