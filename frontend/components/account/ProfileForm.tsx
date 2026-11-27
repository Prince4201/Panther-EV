'use client';
import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, User } from 'lucide-react';
import { ApiError, api } from '@/lib/api';
import { prepareImage } from '@/lib/imagePrep';
import { useAuth, type Account } from '@/components/auth/AuthProvider';
import { Field, Notice, btnPrimary, inputCls } from './fields';

const blank = { name: '', phone: '', avatar: '', line1: '', city: '', state: '', pincode: '', country: 'India' };

/** Profile for every role: photo, name, phone and address. E-mail is shown but cannot be edited here. */
export function ProfileForm() {
  const { account, role, refresh } = useAuth();
  const [v, setV] = useState(blank);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [imgError, setImgError] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!account) return;
    setV({ name: account.name, phone: account.phone ?? '', avatar: account.avatar ?? '', line1: account.address?.line1 ?? '', city: account.address?.city ?? '', state: account.address?.state ?? '', pincode: account.address?.pincode ?? '', country: account.address?.country || 'India' });
    setImgError(false);
  }, [account]);
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) => setV((p) => ({ ...p, [k]: e.target.value }));

  const uploadPhoto = async (f: File) => {
    setPhotoBusy(true); setMsg(null); setImgError(false);
    try {
      // 1. Prepare image in browser - resize to 400px for a sharp, ultra-compact avatar (under 30KB)
      const ready = await prepareImage(f, 400);

      // 2. Read as base64 Data URL for instant, permanent, cross-origin-safe display & storage
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(ready);
      });

      if (dataUrl) {
        setV((p) => ({ ...p, avatar: dataUrl }));
        setImgError(false);
      }

      // 3. Also upload to server (Cloudinary or backend fallback)
      try {
        const fd = new FormData(); fd.append('image', ready, ready.name);
        const r = await api<{ url: string }>('/auth/upload-avatar', { method: 'POST', body: fd });
        if (r.url) {
          setV((p) => ({ ...p, avatar: r.url }));
        }
      } catch {
        // If server endpoint has issues, dataUrl is already set and works permanently!
      }

      setMsg({ ok: true, text: 'Photo ready! Click "Save profile" below to apply.' });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof ApiError ? e.message : 'Upload failed.' });
    } finally {
      setPhotoBusy(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null); setErrs({});
    try {
      await api('/auth/profile', { method: 'PUT', body: JSON.stringify({ name: v.name, phone: v.phone, avatar: v.avatar, address: { line1: v.line1, city: v.city, state: v.state, pincode: v.pincode, country: v.country } }) });
      await refresh();
      setMsg({ ok: true, text: 'Profile saved.' });
    } catch (err) {
      if (err instanceof ApiError) { setErrs(Object.fromEntries(Object.entries(err.fieldErrors ?? {}).map(([k, m]) => [k.replace('address.', ''), m]))); setMsg({ ok: false, text: err.message }); }
      else setMsg({ ok: false, text: 'Could not save.' });
    } finally { setBusy(false); }
  };

  if (!account) return null;
  const roleLabel = role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Customer';
  return (
    <form onSubmit={save} noValidate className="max-w-2xl space-y-6">
      <div className="flex items-center gap-5">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-fog">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {v.avatar && !imgError ? (
            <img
              src={v.avatar}
              alt="Profile photo"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-steel" aria-hidden />
          )}
        </div>
        <div>
          <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ''; }} />
          <button type="button" onClick={() => file.current?.click()} disabled={photoBusy} className="inline-flex items-center gap-2 border border-ink px-3 py-2 text-sm font-semibold hover:bg-ink hover:text-white disabled:opacity-60">
            {photoBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}{photoBusy ? 'Uploading…' : 'Change photo'}
          </button>
          {v.avatar && <button type="button" onClick={() => { setV((p) => ({ ...p, avatar: '' })); setImgError(false); }} className="ml-3 text-sm text-steel underline">Remove</button>}
          <p className="mt-1 text-xs text-steel">JPG, PNG, WebP or AVIF, up to 8 MB. Save to apply.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="p-name" label="Full name" error={errs.name}><input id="p-name" value={v.name} onChange={set('name')} autoComplete="name" className={inputCls} /></Field>
        <Field id="p-email" label="Email" hint={`Signed in as ${roleLabel}. Email cannot be changed here.`}><input id="p-email" value={account.email} disabled className={inputCls} /></Field>
        <Field id="p-phone" label="Phone" error={errs.phone}><input id="p-phone" type="tel" value={v.phone} onChange={set('phone')} autoComplete="tel" className={inputCls} /></Field>
      </div>

      <fieldset className="space-y-5">
        <legend className="mb-1 font-display text-2xl">Address</legend>
        <Field id="p-line1" label="Address" error={errs.line1}><input id="p-line1" value={v.line1} onChange={set('line1')} autoComplete="address-line1" className={inputCls} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="p-city" label="City" error={errs.city}><input id="p-city" value={v.city} onChange={set('city')} autoComplete="address-level2" className={inputCls} /></Field>
          <Field id="p-state" label="State" error={errs.state}><input id="p-state" value={v.state} onChange={set('state')} autoComplete="address-level1" className={inputCls} /></Field>
          <Field id="p-pin" label="Pincode" error={errs.pincode}><input id="p-pin" inputMode="numeric" value={v.pincode} onChange={set('pincode')} autoComplete="postal-code" className={inputCls} /></Field>
          <Field id="p-country" label="Country" hint="Country is locked to your registered account." error={errs.country}>
            <input id="p-country" value={v.country} disabled className={`${inputCls} opacity-60 cursor-not-allowed bg-slate-50`} />
          </Field>
        </div>
      </fieldset>

      {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}
      <button disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  );
}
