import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { VehicleBrowser } from '@/components/vehicles/VehicleBrowser';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { AddToEnquiry } from '@/components/vehicles/AddToEnquiry';
import { rangeFeatures, SPEC_FALLBACK } from '@/data/products';
import { categoryTitle, getCatalog } from '@/lib/catalog';
import { formatPrice, isExternalImage } from '@/lib/media';

type Props = { params: Promise<{ slug: string }> };

// Known vehicles and categories are pre-built; ones added later in Admin > Vehicles are rendered on first visit.
export async function generateStaticParams() {
  const { products, categories } = await getCatalog();
  return [...categories.map((c) => ({ slug: c.slug })), ...products.map((p) => ({ slug: p.slug }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { products, categories } = await getCatalog();
  const cat = categories.find((c) => c.slug === slug);
  if (cat) return { title: cat.title, description: cat.intro || `${cat.title} from Panther EV.`, alternates: { canonical: `/vehicles/${slug}` } };
  const p = products.find((x) => x.slug === slug);
  if (!p) return {};
  const description = `${p.summary} Explore features and enquire about the ${p.name} from Panther EV.`;
  return {
    title: p.name, description, alternates: { canonical: `/vehicles/${slug}` },
    openGraph: { title: `${p.name} | Panther EV`, description, images: [{ url: p.image, alt: p.name }] },
    twitter: { card: 'summary_large_image', title: p.name, description, images: [p.image] },
  };
}

export default async function VehicleRoute({ params }: Props) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const { products, categories } = catalog;

  const cat = categories.find((c) => c.slug === slug);
  if (cat) {
    return (
      <>
        <PageHeader title={cat.title} intro={cat.intro} />
        <VehicleBrowser category={cat.key} />
      </>
    );
  }

  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);
  const others = related.length < 3 ? [...related, ...products.filter((x) => x.category !== p.category).slice(0, 3 - related.length)] : related;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.summary, image: p.image, brand: { '@type': 'Brand', name: 'Panther' }, category: categoryTitle(catalog, p.category) };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="bg-fog">
        <div className="mx-auto grid max-w-page items-center gap-8 px-5 py-10 md:px-10 md:py-16 lg:grid-cols-2">
          <div>
            {p.tag && <span className="bg-ink px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">{p.tag}</span>}
            <h1 className="mt-4 font-display text-6xl leading-[0.9] md:text-8xl">{p.name}</h1>
            <p className="mt-4 max-w-md text-lg text-steel">{p.summary}</p>
            {p.description && <p className="mt-4 max-w-md whitespace-pre-line text-steel">{p.description}</p>}
            <p className="mt-6 text-sm text-steel">Price: <span className="font-semibold text-ink">{p.price != null ? formatPrice(p.price) : 'Contact Panther for the latest price'}</span></p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <AddToEnquiry slug={p.slug} name={p.name} image={p.image} className="bg-panther-red text-white !border-panther-red hover:!bg-ink hover:!border-ink" />
              <Button href="/dealers" variant="outlineDark">Find a dealer</Button>
              <Button href={`/compare?v=${p.slug}`} variant="ghost" className="py-3.5">Compare</Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full">
            <Image src={p.image} unoptimized={isExternalImage(p.image)} alt={p.name} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-contain drop-shadow-[0_24px_24px_rgba(0,0,0,0.2)]" />
          </div>
        </div>
      </section>

      <nav aria-label="On this page" className="sticky top-[72px] z-20 border-b border-line bg-white lg:top-[80px]">
        <ul className="no-scrollbar mx-auto flex max-w-page gap-7 overflow-x-auto px-5 text-sm font-semibold uppercase tracking-wider md:px-10">
          {['features', 'specifications', 'related'].map((id) => <li key={id}><a href={`#${id}`} className="block whitespace-nowrap py-4 text-steel hover:text-panther-red">{id === 'related' ? 'Related vehicles' : id}</a></li>)}
        </ul>
      </nav>

      <section id="features" className="mx-auto max-w-page scroll-mt-32 px-5 py-16 md:px-10 md:py-24">
        <h2 className="font-display text-5xl leading-[0.9] md:text-7xl">Features</h2>
        <ul className="mt-10 grid border-t border-ink md:grid-cols-2 xl:grid-cols-3">
          {rangeFeatures.map((f) => (
            <li key={f.title} className="border-b border-line py-6 md:pr-8"><h3 className="font-display text-3xl">{f.title}</h3><p className="mt-1 text-steel">{f.body}</p></li>
          ))}
        </ul>
      </section>

      <section id="specifications" className="scroll-mt-32 bg-fog py-16 md:py-24">
        <div className="mx-auto max-w-page px-5 md:px-10">
          <h2 className="font-display text-5xl leading-[0.9] md:text-7xl">Specifications</h2>
          <dl className="mt-10 grid border-t border-ink md:grid-cols-2 md:gap-x-16">
            {p.specs.map((s) => (
              <div key={s.label} className="flex justify-between gap-6 border-b border-line py-4"><dt className="font-semibold">{s.label}</dt><dd className="text-right text-steel">{s.value ?? SPEC_FALLBACK}</dd></div>
            ))}
          </dl>
          <div className="mt-8"><Button href={`/contact?subject=${encodeURIComponent(`Specifications for ${p.name}`)}`} arrow>Ask for the full specifications</Button></div>
        </div>
      </section>

      <section id="related" className="mx-auto max-w-page scroll-mt-32 px-5 py-16 md:px-10 md:py-24">
        <h2 className="font-display text-5xl leading-[0.9] md:text-7xl">Related vehicles</h2>
        <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {others.map((r) => <li key={r.slug}><VehicleCard p={r} /></li>)}
        </ul>
      </section>
    </>
  );
}
