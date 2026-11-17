'use client';
import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { HeroSlideForm, emptySlide } from '@/components/admin/HeroSlideForm';
import { ApiError, api } from '@/lib/api';
import { useAdmin } from '@/components/admin/AdminContext';
import { Forbidden } from '@/components/admin/ui';
import type { HeroData, HeroSlideData } from '@/types/hero';
import { cn } from '@/lib/utils';

export default function HeroSlidesPage() {
  const { can } = useAdmin();
  const allowed = can('hero.manage');
  const [data, setData] = useState<HeroData | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<(Omit<HeroSlideData, 'order' | 'mobileImage'> & { mobileImage: string }) | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => api<HeroData>('/admin/hero-slides').then(setData).catch((e: ApiError) => setError(e.message)), []);
  useEffect(() => { if (allowed) load(); }, [load, allowed]);
  if (!allowed) return <Forbidden />;

  const run = async (fn: () => Promise<unknown>) => { setError(''); try { await fn(); await load(); } catch (e) { setError(e instanceof ApiError ? e.message : 'Something went wrong.'); } };
  const move = (i: number, by: number) => {
    if (!data) return;
    const ids = data.slides.map((s) => s._id);
    [ids[i], ids[i + by]] = [ids[i + by], ids[i]];
    run(() => api('/admin/hero-slides/reorder', { method: 'PUT', body: JSON.stringify({ ids }) }));
  };

  const slides = data?.slides ?? [];
  const activeCount = slides.filter((s) => s.active).length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none">Hero banners</h1>
          <p className="mt-2 text-steel">The large banners at the top of the homepage. {data && `${activeCount} of ${slides.length} showing.`}</p>
        </div>
        <div className="flex gap-3">
          <a href="/" target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-ink px-4 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-ink hover:text-white"><ExternalLink className="h-4 w-4" aria-hidden />Preview</a>
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 bg-panther-red px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-ink"><Plus className="h-4 w-4" aria-hidden />Add banner</button>
        </div>
      </div>

      {error && <p role="alert" className="mt-6 bg-red-50 px-4 py-3 text-panther-red">{error}</p>}
      {!data && !error && <div className="mt-8 space-y-3" aria-busy="true">{[0, 1, 2].map((n) => <div key={n} className="h-28 animate-pulse bg-white" />)}</div>}
      {data && slides.length === 0 && <div className="mt-8 bg-white p-10 text-center"><p className="font-display text-3xl">No banners yet</p><p className="mt-1 text-steel">Add your first banner to show it on the homepage.</p></div>}

      <ol className="mt-8 space-y-3">
        {slides.map((s, i) => (
          <li key={s._id} className={cn('flex flex-col gap-4 bg-white p-4 sm:flex-row sm:items-center', !s.active && 'opacity-70')}>
            <div className="flex items-center gap-4">
              <p className="w-10 font-display text-4xl text-steel">{String(i + 1).padStart(2, '0')}</p>
              <div className="h-24 w-40 shrink-0 overflow-hidden border border-line" style={{ backgroundColor: s.bgColor }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={s.imageAlt || s.title} className={cn('h-full w-full', s.fit === 'cover' ? 'object-cover' : 'object-contain p-1')} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-steel">
                <span className={cn('mr-3 inline-block px-2 py-0.5 text-xs font-semibold', s.active ? 'bg-green-100 text-green-800' : 'bg-fog text-steel')}>{s.active ? 'Showing' : 'Hidden'}</span>
                {s.duration ? `${s.duration / 1000} seconds` : `Default time (${(data?.settings.duration ?? 6000) / 1000} s)`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="p-2 hover:bg-fog disabled:opacity-30"><ArrowUp className="h-5 w-5" /></button>
              <button onClick={() => move(i, 1)} disabled={i === slides.length - 1} aria-label="Move down" className="p-2 hover:bg-fog disabled:opacity-30"><ArrowDown className="h-5 w-5" /></button>
              <button onClick={() => setEditing({ ...s, mobileImage: s.mobileImage ?? '' })} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold hover:bg-fog"><Pencil className="h-4 w-4" aria-hidden />Edit</button>
              <button onClick={() => run(() => api(`/admin/hero-slides/${s._id}/toggle`, { method: 'PATCH' }))} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold hover:bg-fog">
                {s.active ? <><EyeOff className="h-4 w-4" aria-hidden />Disable</> : <><Eye className="h-4 w-4" aria-hidden />Enable</>}
              </button>
              <button onClick={() => { if (confirm(`Delete “${s.title}”? This cannot be undone.`)) run(() => api(`/admin/hero-slides/${s._id}`, { method: 'DELETE' })); }} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-panther-red hover:bg-red-50"><Trash2 className="h-4 w-4" aria-hidden />Delete</button>
            </div>
          </li>
        ))}
      </ol>

      {(adding || editing) && (
        <HeroSlideForm slide={editing ?? emptySlide} onClose={() => { setAdding(false); setEditing(null); }} onSaved={() => { setAdding(false); setEditing(null); load(); }} />
      )}
    </div>
  );
}
