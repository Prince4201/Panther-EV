'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Plus } from 'lucide-react';
import { SPEC_FALLBACK } from '@/data/products';
import { useCatalog } from '@/components/catalog/CatalogProvider';
import { isExternalImage } from '@/lib/media';
import { useCart } from '@/components/cart/CartProvider';
import { cn } from '@/lib/utils';

export function VehicleShowcase() {
  const { products, categories, label } = useCatalog();
  const tabs = [{ id: 'all', label: 'All' }, ...categories.filter((c) => products.some((p) => p.category === c.key)).map((c) => ({ id: c.key, label: c.title }))];
  const [tab, setTab] = useState<string>('all');
  const cart = useCart();
  const [picked, setPicked] = useState<string[]>([]);
  const list = products.filter((p) => tab === 'all' || p.category === tab);
  const toggle = (slug: string) => setPicked((s) => s.includes(slug) ? s.filter((x) => x !== slug) : s.length < 3 ? [...s, slug] : s);

  return (
    <section id="vehicles" aria-labelledby="vehicles-title" className="scroll-mt-20 bg-white py-20 md:py-32">
      <div className="mx-auto max-w-page px-5 md:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-panther-red">Our Fleet</p>
            <h2 id="vehicles-title" className="font-display text-6xl leading-[0.9] md:text-8xl">Our vehicles</h2>
          </div>
          <div role="tablist" aria-label="Vehicle category" className="no-scrollbar flex max-w-full gap-6 overflow-x-auto border-b border-line">
            {tabs.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={cn('relative -mb-px whitespace-nowrap pb-3 text-sm font-semibold uppercase tracking-wider transition-colors', tab === t.id ? 'text-ink' : 'text-steel hover:text-ink')}>
                {t.label}
                {tab === t.id && (
                  <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-panther-red shadow-[0_1px_6px_rgba(228,32,43,0.5)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:px-10 xl:mx-auto xl:max-w-page xl:grid xl:grid-cols-3 xl:gap-x-6 xl:gap-y-14 xl:overflow-visible">
        {list.map((p) => {
          const on = picked.includes(p.slug);
          return (
            <li key={p.slug} className="w-[82vw] shrink-0 snap-start sm:w-[46vw] lg:w-[38vw] xl:w-auto">
              <article className="group">
                <Link href={`/vehicles/${p.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-fog via-fog/90 to-fog/70 border border-transparent transition-all duration-500 group-hover:border-panther-red/20 group-hover:shadow-[0_20px_60px_-15px_rgba(228,32,43,0.12)] group-hover:-translate-y-1.5" aria-label={`Explore ${p.name}`}>
                  {p.tag && <span className="absolute left-4 top-4 z-10 rounded-lg bg-ink px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-ink/20">{p.tag}</span>}
                  <Image src={p.image} unoptimized={isExternalImage(p.image)} alt={`${p.name}`} fill sizes="(min-width:1280px) 30vw, (min-width:640px) 46vw, 82vw" className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.08]" />
                  {/* Subtle shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 group-hover:via-white/5 group-hover:to-white/10 transition-all duration-700" aria-hidden />
                </Link>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-steel">{label(p.category)}</p>
                    <h3 className="mt-1 font-display text-4xl leading-none transition-colors duration-300 group-hover:text-panther-red">{p.name}</h3>
                  </div>
                  <button onClick={() => toggle(p.slug)} aria-pressed={on} aria-label={`Compare ${p.name}`}
                    className={cn('flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95', on ? 'border-panther-red bg-panther-red text-white shadow-md shadow-panther-red/30' : 'border-line text-steel hover:border-ink hover:text-ink hover:bg-fog')}>
                    {on ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-3.5 w-3.5" aria-hidden />}Compare
                  </button>
                </div>
                <p className="mt-3 border-t border-line/80 pt-3 text-sm text-steel">Specifications: {SPEC_FALLBACK}</p>
                <div className="mt-4 flex gap-6 text-sm font-semibold uppercase tracking-wider">
                  <Link href={`/vehicles/${p.slug}`} className="border-b-2 border-ink pb-1 transition-all duration-200 hover:border-panther-red hover:text-panther-red">Explore</Link>
                  <button onClick={() => cart.has(p.slug) ? cart.setOpen(true) : cart.add({ slug: p.slug, name: p.name, image: p.image })} className="border-b-2 border-transparent pb-1 text-panther-red transition-all duration-200 hover:border-panther-red">{cart.has(p.slug) ? 'In enquiry cart' : 'Add to enquiry'}</button>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {picked.length > 0 && (
        <div className="fixed inset-x-0 bottom-[60px] z-30 mx-auto flex max-w-xl items-center justify-between gap-4 rounded-2xl bg-ink px-5 py-4 text-white shadow-2xl shadow-ink/40 lg:bottom-6">
          <p className="text-sm">{picked.length} selected <span className="text-white/50">(max 3)</span></p>
          <div className="flex gap-4">
            <button onClick={() => setPicked([])} className="text-sm text-white/60 hover:text-white transition-colors">Clear</button>
            <Link href={`/compare?v=${picked.join(',')}`} className="rounded-lg bg-panther-red px-4 py-2 text-sm font-semibold uppercase tracking-wider shadow-lg shadow-panther-red/30 transition-all hover:shadow-xl hover:shadow-panther-red/40 hover:-translate-y-px active:scale-95">Compare</Link>
          </div>
        </div>
      )}
    </section>
  );
}
