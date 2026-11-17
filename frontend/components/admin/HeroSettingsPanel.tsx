'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { ApiError, api } from '@/lib/api';
import type { HeroSettings } from '@/types/hero';

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-center justify-between border-b border-line py-4">
    <span className="font-medium">{label}</span>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[#E4202B]" />
  </label>
);

type Status = { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved'; live: boolean } | { kind: 'error'; text: string };
const DURATIONS = [3, 4, 5, 6, 7, 8, 10];

export function HeroSettingsPanel() {
  const [s, setS] = useState<HeroSettings | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  useEffect(() => { api<{ settings: HeroSettings }>('/admin/settings/hero').then((r) => setS(r.settings)).catch((e: ApiError) => setLoadErr(e.message)); }, []);
  // Editing after a save clears the old result, so "saved" never sits next to unsaved changes.
  const set = <K extends keyof HeroSettings>(k: K, v: HeroSettings[K]) => { setS((p) => (p ? { ...p, [k]: v } : p)); setStatus((st) => (st.kind === 'saving' ? st : { kind: 'idle' })); };

  const save = async () => {
    if (!s || status.kind === 'saving') return;
    setStatus({ kind: 'saving' });
    try {
      // The server answers only after MongoDB is updated and the website was told to drop its cached copy.
      // `live` is true when the website confirmed it; nothing is reported as saved unless this call succeeded.
      const r = await api<{ settings: HeroSettings; live?: boolean }>('/admin/settings/hero', { method: 'PUT', body: JSON.stringify(s) });
      setS(r.settings);
      setStatus({ kind: 'saved', live: !!r.live });
    } catch (e) {
      // The form keeps what was typed, so the admin can simply try again.
      const detail = e instanceof ApiError && e.status !== 0 && e.status < 500 ? e.message : 'Please check your connection and try again.';
      setStatus({ kind: 'error', text: detail });
    }
  };

  const saving = status.kind === 'saving';
  const options = s && !DURATIONS.includes(s.duration / 1000) ? [...DURATIONS, s.duration / 1000].sort((a, b) => a - b) : DURATIONS;
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-3xl leading-none">Homepage banner settings</h2>
      <p className="mt-2 text-steel">How the banners move on the homepage.</p>
      {loadErr && <p role="alert" className="mt-4 bg-red-50 px-4 py-3 text-panther-red">{loadErr}</p>}
      {!s ? (loadErr ? null : <div className="mt-8 h-64 animate-pulse bg-white" aria-busy="true" />) : (
        <div className="mt-8 bg-white px-6 py-2">
          <Toggle label="Change banners automatically" checked={s.autoplay} onChange={(v) => set('autoplay', v)} />
          <label className="flex items-center justify-between border-b border-line py-4">
            <span className="font-medium">Time on each banner</span>
            <select value={s.duration} onChange={(e) => set('duration', Number(e.target.value))} className="border border-line px-3 py-2">
              {options.map((n) => <option key={n} value={n * 1000}>{n} seconds</option>)}
            </select>
          </label>
          <Toggle label="Pause when the mouse is over the banner" checked={s.pauseOnHover} onChange={(v) => set('pauseOnHover', v)} />
          <Toggle label="Show slide indicators" checked={s.showIndicators} onChange={(v) => set('showIndicators', v)} />
          <Toggle label="Show previous / next arrows" checked={s.showArrows} onChange={(v) => set('showArrows', v)} />
          <label className="flex items-center justify-between py-4">
            <span className="font-medium">Transition</span>
            <select value={s.transition} onChange={(e) => set('transition', e.target.value as HeroSettings['transition'])} className="border border-line px-3 py-2"><option value="fade">Fade</option><option value="slide">Slide</option></select>
          </label>
        </div>
      )}
      {status.kind === 'saving' && <p role="status" className="mt-4 bg-fog px-4 py-3 text-steel">Saving settings…</p>}
      {status.kind === 'saved' && (
        <p role="status" className="mt-4 flex items-start gap-2 bg-green-50 px-4 py-3 text-green-800">
          <Check className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <span>Settings saved successfully. {status.live ? 'Changes are now live.' : 'Changes are being applied and will appear on the homepage within a few seconds.'}</span>
        </p>
      )}
      {status.kind === 'error' && (
        <p role="alert" className="mt-4 flex items-start gap-2 bg-red-50 px-4 py-3 text-panther-red">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <span>Unable to save settings. {status.text}</span>
        </p>
      )}
      {s && (
        <button onClick={save} disabled={saving} aria-busy={saving} className="mt-6 inline-flex items-center gap-2 bg-panther-red px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-ink disabled:opacity-60">
          {saving ? 'Saving…' : status.kind === 'saved' ? <>Saved <Check className="h-4 w-4" aria-hidden /></> : 'Save settings'}
        </button>
      )}
    </div>
  );
}
