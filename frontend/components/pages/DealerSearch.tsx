'use client';
import { useMemo, useState } from 'react';
import { ExternalLink, MapPin, Phone, Search } from 'lucide-react';
import { dealers, mapsUrl } from '@/data/dealers';
import { Button } from '@/components/ui/Button';

export function DealerSearch({ initial = '' }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? dealers.filter((d) => `${d.name} ${d.city} ${d.state} ${d.pincode} ${d.address}`.toLowerCase().includes(s)) : dealers;
  }, [q]);

  return (
    <section className="mx-auto max-w-page px-5 py-12 md:px-10 md:py-16">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="max-w-xl">
        <label htmlFor="dealer-search" className="mb-1.5 block text-sm font-semibold">State, city or pincode</label>
        <div className="flex">
          <input id="dealer-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Meerut or 250002" className="w-full border border-ink px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-panther-amber" />
          <span className="flex items-center bg-ink px-5 text-white" aria-hidden><Search className="h-5 w-5" /></span>
        </div>
      </form>

      <p className="mt-8 text-sm text-steel" aria-live="polite">{results.length} {results.length === 1 ? 'location' : 'locations'}{q.trim() && ` for “${q.trim()}”`}</p>

      {results.length === 0 ? (
        <div className="mt-6 border border-dashed border-line p-8 md:p-12">
          <p className="font-display text-4xl">No Panther dealer listed here yet</p>
          <p className="mt-2 max-w-lg text-steel">The network is growing. Call or send an enquiry and Panther will connect you with the nearest dealer or the factory sales team.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Button href="/contact" arrow>Send an enquiry</Button><Button href="/dealership" variant="outlineDark">Become a dealer</Button></div>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((d) => (
            <li key={d.id} className="flex flex-col border border-line p-6">
              <span className="w-fit bg-ink px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">{d.type}</span>
              <h2 className="mt-4 font-display text-3xl leading-tight">{d.name}</h2>
              <address className="mt-3 flex gap-2 text-sm not-italic text-steel"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /><span>{d.address}<br />{d.city}, {d.state} – {d.pincode}</span></address>
              {d.phone && <p className="mt-2 flex items-center gap-2 text-sm"><Phone className="h-4 w-4 shrink-0 text-steel" aria-hidden /><a href={`tel:${d.phone.replace(/\s/g, '')}`} className="hover:text-panther-red">{d.phone}</a></p>}
              <p className="mt-2 text-sm text-steel">Opening hours: {d.hours ?? 'Contact for timings'}</p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold uppercase tracking-wider">
                <a href={mapsUrl(d)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border-b-2 border-ink pb-1 hover:border-panther-red hover:text-panther-red">Open in Maps<ExternalLink className="h-3.5 w-3.5" aria-hidden /></a>
                <a href={`/contact?subject=${encodeURIComponent(`Enquiry for ${d.name}, ${d.city}`)}`} className="border-b-2 border-transparent pb-1 text-panther-red hover:border-panther-red">Enquire</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
