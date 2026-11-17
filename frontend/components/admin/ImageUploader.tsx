'use client';
import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { ApiError, api } from '@/lib/api';
import { prepareImage } from '@/lib/imagePrep';

interface Props { label: string; value: string; onChange: (url: string, publicId?: string) => void; hint?: string; folder?: 'hero' | 'products' | 'partners' | 'avatars' | 'team'; /** Preview on a dark tile (for white logos). */ dark?: boolean; }

/** Upload to Cloudinary through the backend, or paste an image link. Only the link is stored in MongoDB. */
export function ImageUploader({ label, value, onChange, hint, folder = 'hero', dark = false }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    setBusy(true); setError('');
    try {
      // Large pictures are scaled down in the browser first, so they fit the upload limits (see lib/imagePrep.ts).
      const ready = await prepareImage(file);
      const fd = new FormData(); fd.append('image', ready, ready.name);
      const r = await api<{ url: string; publicId: string }>(`/admin/upload?folder=${folder}`, { method: 'POST', body: fd });
      onChange(r.url, r.publicId);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Upload failed.'); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{label}</p>
      <div className="flex gap-4">
        <div className={`relative grid h-24 w-36 shrink-0 place-items-center overflow-hidden border border-line p-2 ${dark ? 'bg-ink' : 'bg-fog'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" className="h-full w-full object-contain" /> : <ImagePlus className="h-6 w-6 text-steel" aria-hidden />}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste an image link, or upload" aria-label={`${label} link`} className="w-full border border-line px-3 py-2 text-sm focus:border-ink focus:outline-none" />
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="inline-flex items-center gap-2 border border-ink px-3 py-2 text-sm font-semibold hover:bg-ink hover:text-white disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}{busy ? 'Preparing and uploading…' : 'Upload image'}
          </button>
          {hint && <p className="text-xs text-steel">{hint}</p>}
          {error && <p role="alert" className="text-sm text-panther-red">{error}</p>}
        </div>
      </div>
    </div>
  );
}
