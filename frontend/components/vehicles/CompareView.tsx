'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { SPEC_FALLBACK } from '@/data/products';
import { useCatalog } from '@/components/catalog/CatalogProvider';
import { isExternalImage } from '@/lib/media';
import type { Product } from '@/types/product';
import { AddToEnquiry } from './AddToEnquiry';

const MAX = 3;

export function CompareView() {
  const router = useRouter();
  const params = useSearchParams();
  const { products, getProduct, label } = useCatalog();
  const slugs = (params.get('v') ?? '').split(',').filter(Boolean).filter((s, i, a) => a.indexOf(s) === i).slice(0, MAX);
  const chosen = slugs.map(getProduct).filter((p): p is Product => !!p);
  const set = (next: string[]) => router.replace(next.length ? `/compare?v=${next.join(',')}` : '/compare', { scroll: false });
  const available = products.filter((p) => !chosen.some((c) => c.slug === p.slug));
  const labels = Array.from(new Set(products.flatMap((p) => p.specs.map((s) => s.label))));

  return (
    <div className="mx-auto max-w-page px-5 py-12 md:px-10 md:py-16">
      {chosen.length < MAX && (
        <div className="mb-8 max-w-sm">
          <label htmlFor="add-vehicle" className="mb-1.5 block text-sm font-semibold">Add a vehicle (up to {MAX})</label>
          <select id="add-vehicle" value="" onChange={(e) => e.target.value && set([...chosen.map((c) => c.slug), e.target.value])} className="w-full border border-ink bg-white px-4 py-3">
            <option value="">Choose a vehicle…</option>
            {available.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </div>
      )}

      {chosen.length === 0 ? (
        <div className="border border-dashed border-line p-10 text-center">
          <p className="font-display text-4xl">Nothing to compare yet</p>
          <p className="mt-2 text-steel">Pick two or three vehicles above, or choose “Compare” on any vehicle card.</p>
          <Link href="/vehicles" className="mt-6 inline-block bg-panther-red px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-ink">Browse vehicles</Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">Vehicle comparison</caption>
            <thead>
              <tr>
                <th scope="col" className="w-36 border-b border-ink p-3 align-bottom text-sm font-semibold text-steel md:w-52">Model</th>
                {chosen.map((p) => (
                  <th key={p.slug} scope="col" className="relative border-b border-ink p-3 align-top font-normal">
                    <button onClick={() => set(chosen.filter((c) => c.slug !== p.slug).map((c) => c.slug))} aria-label={`Remove ${p.name}`} className="absolute right-2 top-2 z-10 bg-white p-1.5 text-steel hover:text-panther-red"><X className="h-4 w-4" /></button>
                    <div className="relative aspect-[4/3] bg-fog"><Image src={p.image} unoptimized={isExternalImage(p.image)} alt={p.name} fill sizes="(min-width:768px) 28vw, 60vw" className="object-contain p-3" /></div>
                    <Link href={`/vehicles/${p.slug}`} className="mt-3 block font-display text-3xl leading-none hover:text-panther-red">{p.name}</Link>
                    <p className="text-sm text-steel">{label(p.category)}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line"><th scope="row" className="p-3 text-sm font-semibold">Highlight</th>{chosen.map((p) => <td key={p.slug} className="p-3 text-steel">{p.tag}</td>)}</tr>
              {labels.map((l) => (
                <tr key={l} className="border-b border-line"><th scope="row" className="p-3 text-sm font-semibold">{l}</th>{chosen.map((p) => <td key={p.slug} className="p-3 text-steel">{p.specs.find((s) => s.label === l)?.value ?? SPEC_FALLBACK}</td>)}</tr>
              ))}
              <tr><th scope="row" className="p-3" />{chosen.map((p) => <td key={p.slug} className="p-3"><AddToEnquiry slug={p.slug} name={p.name} image={p.image} className="w-full px-3 text-xs" /></td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
