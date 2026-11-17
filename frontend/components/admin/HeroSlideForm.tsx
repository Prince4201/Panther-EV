'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { ApiError, api } from '@/lib/api';
import type { HeroSlideData } from '@/types/hero';

type Draft = Omit<HeroSlideData, '_id' | 'order' | 'mobileImage'> & { _id?: string; mobileImage: string };

export const emptySlide: Draft = {
  title: '', subtitle: '', description: '', image: '', mobileImage: '', imageAlt: '', fit: 'cover', bgColor: '#EEF0F2',
  textColor: 'light', textAlign: 'left', overlay: 35, button1Text: 'Explore vehicles', button1Url: '/vehicles', button2Text: 'Enquire now', button2Url: '/contact', active: true, duration: null,
};

const input = 'w-full border border-line px-3 py-2.5 focus:border-ink focus:outline-none';
const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <label className="block"><span className="mb-1.5 block text-sm font-semibold">{label}</span>{children}{error && <span role="alert" className="mt-1 block text-sm text-panther-red">{error}</span>}</label>
);

export function HeroSlideForm({ slide, onClose, onSaved }: { slide: Draft; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Draft>({ ...emptySlide, ...slide, mobileImage: slide.mobileImage ?? '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((s) => ({ ...s, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErrors({}); setFormError('');
    const { _id, ...body } = d;
    try {
      await api(_id ? `/admin/hero-slides/${_id}` : '/admin/hero-slides', { method: _id ? 'PUT' : 'POST', body: JSON.stringify(body) });
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) { setFormError(err.message); setErrors(err.fieldErrors ?? {}); } else setFormError('Could not save.');
    } finally { setSaving(false); }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={d._id ? 'Edit banner' : 'Add hero banner'} className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <form onSubmit={save} noValidate className="flex h-full w-full max-w-2xl flex-col bg-white">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-3xl">{d._id ? 'Edit banner' : 'Add hero banner'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2"><X className="h-6 w-6" /></button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <ImageUploader label="Banner image (desktop)" value={d.image} onChange={(url) => set('image', url)} hint="Wide image, about 1920 × 800. Photos fill the banner; choose 'Vehicle on plain colour' for cut-outs." />
          {errors.image && <p role="alert" className="-mt-4 text-sm text-panther-red">{errors.image}</p>}
          <ImageUploader label="Banner image (mobile, optional)" value={d.mobileImage} onChange={(url) => set('mobileImage', url)} hint="Tall image, about 900 × 1100." />
          <Field label="Image description (for screen readers)" error={errors.imageAlt}><input className={input} value={d.imageAlt} onChange={(e) => set('imageAlt', e.target.value)} /></Field>
          <Field label="Title" error={errors.title}><input className={input} value={d.title} onChange={(e) => set('title', e.target.value)} /></Field>
          <Field label="Subtitle" error={errors.subtitle}><input className={input} value={d.subtitle} onChange={(e) => set('subtitle', e.target.value)} /></Field>
          <Field label="Description (optional)" error={errors.description}><textarea rows={2} className={input} value={d.description} onChange={(e) => set('description', e.target.value)} /></Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button 1 text" error={errors.button1Text}><input className={input} value={d.button1Text} onChange={(e) => set('button1Text', e.target.value)} /></Field>
            <Field label="Button 1 link" error={errors.button1Url}><input className={input} value={d.button1Url} onChange={(e) => set('button1Url', e.target.value)} placeholder="/vehicles" /></Field>
            <Field label="Button 2 text" error={errors.button2Text}><input className={input} value={d.button2Text} onChange={(e) => set('button2Text', e.target.value)} /></Field>
            <Field label="Button 2 link" error={errors.button2Url}><input className={input} value={d.button2Url} onChange={(e) => set('button2Url', e.target.value)} placeholder="/contact" /></Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Image style">
              <select className={input} value={d.fit} onChange={(e) => set('fit', e.target.value as Draft['fit'])}>
                <option value="cover">Photo fills the banner</option><option value="contain">Vehicle on plain colour</option>
              </select>
            </Field>
            <Field label="Background colour (plain colour style)" error={errors.bgColor}><input type="color" className="h-11 w-full border border-line" value={d.bgColor} onChange={(e) => set('bgColor', e.target.value)} /></Field>
            <Field label="Text colour">
              <select className={input} value={d.textColor} onChange={(e) => set('textColor', e.target.value as Draft['textColor'])}>
                <option value="dark">Dark text (for light images)</option><option value="light">White text (for dark images)</option>
              </select>
            </Field>
            <Field label="Text position">
              <select className={input} value={d.textAlign} onChange={(e) => set('textAlign', e.target.value as Draft['textAlign'])}>
                <option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option>
              </select>
            </Field>
            <Field label={`Dark overlay: ${d.overlay}%`}><input type="range" min={0} max={80} value={d.overlay} onChange={(e) => set('overlay', Number(e.target.value))} className="w-full accent-[#E4202B]" /></Field>
            <Field label="Time on screen" error={errors.duration}>
              <select className={input} value={d.duration ?? ''} onChange={(e) => set('duration', e.target.value ? Number(e.target.value) : null)}>
                <option value="">Use the default time</option>{[5, 6, 7, 8, 10].map((s) => <option key={s} value={s * 1000}>{s} seconds</option>)}
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-3"><input type="checkbox" checked={d.active} onChange={(e) => set('active', e.target.checked)} className="h-5 w-5 accent-[#E4202B]" /><span className="text-sm font-semibold">Show this banner on the homepage</span></label>
        </div>
        <div className="border-t border-line px-6 py-4">
          {formError && <p role="alert" className="mb-3 text-sm text-panther-red">{formError}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="border border-ink px-5 py-3 text-sm font-semibold uppercase tracking-wider">Cancel</button>
            <button disabled={saving} className="bg-panther-red px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-ink disabled:opacity-60">{saving ? 'Saving…' : 'Save banner'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
