'use client';
import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { PartnerLogoCard } from '@/components/partners/PartnerLogoCard';
import { api, ApiError } from '@/lib/api';
import { useAdmin } from '@/components/admin/AdminContext';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ActiveBadge, Card, Empty, ErrorNote, Forbidden, Loading, PageTitle, btn, btnLine, input } from '@/components/admin/ui';
import { LOGO_SCALE, categoryTitle, logoScaleOf, logoScaleStyle, type FinanceCategory, type FinancePartner } from '@/types/finance';

type Form = { name: string; category: FinanceCategory; description: string; logo: string; logoPublicId: string; logoBg: 'light' | 'dark'; logoScale: number; website: string; contactPhone: string; contactEmail: string; active: boolean };
const blank: Form = { name: '', category: 'financing', description: '', logo: '', logoPublicId: '', logoBg: 'light', logoScale: 100, website: '', contactPhone: '', contactEmail: '', active: true };

/** Admin > Finance: the companies shown on the public /finance page. */
export default function FinanceAdmin() {
  const { can } = useAdmin();
  const [list, setList] = useState<FinancePartner[] | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api<{ partners: FinancePartner[] }>('/admin/finance-partners').then((r) => setList(r.partners)).catch((e: ApiError) => setErr(e.message)), []);
  useEffect(() => { if (can('finance.manage')) load(); }, [load, can]);
  if (!can('finance.manage')) return <Forbidden />;

  const run = async (fn: () => Promise<unknown>) => { setErr(''); try { await fn(); await load(); } catch (e) { setErr(e instanceof ApiError ? e.message : 'Something went wrong.'); } };
  const move = (i: number, by: number) => { if (!list) return; const ids = list.map((p) => p._id); [ids[i], ids[i + by]] = [ids[i + by], ids[i]]; run(() => api('/admin/finance-partners/reorder', { method: 'PUT', body: JSON.stringify({ ids }) })); };
  const open = (p?: FinancePartner) => { setErrs({}); setErr(''); setEditId(p?._id ?? null); setForm(p ? { name: p.name, category: p.category, description: p.description, logo: p.logo, logoPublicId: p.logoPublicId ?? '', logoBg: p.logoBg ?? 'light', logoScale: logoScaleOf(p), website: p.website, contactPhone: p.contactPhone, contactEmail: p.contactEmail, active: p.active } : { ...blank }); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.name.trim()) { setErrs({ name: 'Add the company name' }); return; }
    setBusy(true); setErrs({}); setErr('');
    try {
      await api(editId ? `/admin/finance-partners/${editId}` : '/admin/finance-partners', { method: editId ? 'PUT' : 'POST', body: JSON.stringify(form) });
      setForm(null); setEditId(null); await load();
    } catch (er) { if (er instanceof ApiError) { setErrs(er.fieldErrors ?? {}); setErr(er.message); } else setErr('Could not save.'); }
    finally { setBusy(false); }
  };
  const set = <K extends keyof Form>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => (f ? { ...f, [k]: e.target.value } : f));
  const setScale = (n: number) => setForm((f) => (f ? { ...f, logoScale: Math.min(LOGO_SCALE.max, Math.max(LOGO_SCALE.min, Math.round(n))) } : f));
  const fe = (k: string) => errs[k] && <span role="alert" className="mt-1 block text-sm font-normal text-panther-red">{errs[k]}</span>;

  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title="Finance" sub="Finance partners and trusted companies. Shown on the Finance page, in “Latest from Panther” and in the footer; hidden companies appear nowhere." action={!form && <button className={btn} onClick={() => open()}><Plus className="h-4 w-4" aria-hidden />Add company</button>} />
      {err && <div className="mb-4"><ErrorNote>{err}</ErrorNote></div>}

      {form && (
        <Card title={editId ? 'Edit company' : 'Add company'} className="mb-6">
          <form onSubmit={save} noValidate className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold">Company name<input value={form.name} onChange={set('name')} maxLength={120} className={`${input} mt-1.5 font-normal`} />{fe('name')}</label>
            <label className="block text-sm font-semibold">Type<select value={form.category} onChange={set('category')} className={`${input} mt-1.5 font-normal`}>{(Object.keys(categoryTitle) as FinanceCategory[]).map((k) => <option key={k} value={k}>{categoryTitle[k]}</option>)}</select></label>
            <label className="block text-sm font-semibold md:col-span-2">Short description<textarea value={form.description} onChange={set('description')} rows={2} maxLength={400} className={`${input} mt-1.5 font-normal`} />{fe('description')}</label>
            <div className="md:col-span-2"><ImageUploader label="Logo" folder="partners" dark={form.logoBg === 'dark'} value={form.logo} onChange={(url, id) => setForm((f) => (f ? { ...f, logo: url, logoPublicId: id ?? '' } : f))} hint="Upload a PNG or WebP (transparent looks best), or paste a link. The logo is shown as it is, never stretched." />{fe('logo')}</div>
            {/* Logo size: display only. The uploaded file is not changed, cropped or stretched. */}
            <div className="md:col-span-2">
              <p className="mb-1.5 text-sm font-semibold">Logo size</p>
              <div className="grid items-center gap-5 sm:grid-cols-[1fr_240px]">
                <div>
                  <div className="flex items-center gap-3">
                    <button type="button" aria-label="Make the logo smaller" disabled={form.logoScale <= LOGO_SCALE.min} onClick={() => setScale(form.logoScale - LOGO_SCALE.step)} className="grid h-10 w-10 shrink-0 place-items-center border border-ink hover:bg-ink hover:text-white disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                    <input type="range" aria-label="Logo size in percent" min={LOGO_SCALE.min} max={LOGO_SCALE.max} step={LOGO_SCALE.step} value={form.logoScale} onChange={(e) => setScale(Number(e.target.value))} className="h-2 min-w-0 flex-1 cursor-pointer accent-[#E4202B]" />
                    <button type="button" aria-label="Make the logo bigger" disabled={form.logoScale >= LOGO_SCALE.max} onClick={() => setScale(form.logoScale + LOGO_SCALE.step)} className="grid h-10 w-10 shrink-0 place-items-center border border-ink hover:bg-ink hover:text-white disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                    <output className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums">{form.logoScale}%</output>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-steel">
                    <button type="button" onClick={() => setScale(LOGO_SCALE.base)} disabled={form.logoScale === LOGO_SCALE.base} className="font-semibold text-panther-red hover:text-ink disabled:text-steel disabled:opacity-60">Reset to 100%</button>
                    <span>{LOGO_SCALE.min}% to {LOGO_SCALE.max}%. Only how large this company’s logo is shown; the image itself is not changed.</span>
                  </div>
                  {fe('logoScale')}
                </div>
                <div>
                  <p className="mb-1 text-xs text-steel">Preview (as on the Finance page)</p>
                  <PartnerLogoCard partner={{ _id: 'preview', name: form.name || 'Company', category: form.category, description: '', logo: form.logo, logoBg: form.logoBg, logoScale: form.logoScale, website: '', contactPhone: '', contactEmail: '', order: 0, active: true }} size="lg" showName />
                </div>
              </div>
            </div>
            <label className="block text-sm font-semibold">Logo colours<select value={form.logoBg} onChange={set('logoBg')} className={`${input} mt-1.5 font-normal`}><option value="light">Dark / coloured logo (light card)</option><option value="dark">White logo (dark card)</option></select></label>
            <label className="block text-sm font-semibold">Website<input type="url" value={form.website} onChange={set('website')} placeholder="https://" className={`${input} mt-1.5 font-normal`} /><span className="mt-1 block text-xs font-normal text-steel">Clicking the logo on the website opens this address.</span>{fe('website')}</label>
            <label className="block text-sm font-semibold">Phone<input type="tel" value={form.contactPhone} onChange={set('contactPhone')} className={`${input} mt-1.5 font-normal`} />{fe('contactPhone')}</label>
            <label className="block text-sm font-semibold">Email<input type="email" value={form.contactEmail} onChange={set('contactEmail')} className={`${input} mt-1.5 font-normal`} />{fe('contactEmail')}</label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => (f ? { ...f, active: e.target.checked } : f))} className="h-4 w-4 accent-[#E4202B]" />Show on the website</label>
            <p className="text-xs text-steel md:col-span-2">Website, phone and email are shown publicly. Leave blank what you do not want to publish.</p>
            <div className="flex gap-3 md:col-span-2"><button disabled={busy} className={btn}>{busy ? 'Saving…' : 'Save'}</button><button type="button" className={btnLine} onClick={() => { setForm(null); setEditId(null); }}>Cancel</button></div>
          </form>
        </Card>
      )}

      {!list ? <Loading /> : list.length === 0 ? <Empty>No companies yet. Add your first finance partner or trusted company.</Empty> : (
        <ul className="space-y-3">
          {list.map((p, i) => (
            <li key={p._id} className="flex flex-wrap items-center gap-4 bg-white p-4">
              <div className={`grid h-14 w-24 shrink-0 place-items-center overflow-hidden p-2 ${p.logoBg === 'dark' ? 'bg-ink' : 'bg-fog'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.logo ? <img src={p.logo} alt="" style={logoScaleStyle(p)} className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-steel">No logo</span>}
              </div>
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.name}</p><p className="truncate text-xs text-steel">{categoryTitle[p.category]}{p.website ? ` · ${p.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}` : ' · no website set'}</p></div>
              <ActiveBadge active={p.active} />
              <div className="flex items-center gap-1">
                <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="p-2 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                <button aria-label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)} className="p-2 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                <button aria-label={p.active ? 'Hide' : 'Show'} onClick={() => run(() => api(`/admin/finance-partners/${p._id}/toggle`, { method: 'PATCH' }))} className="p-2">{p.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button aria-label="Edit" onClick={() => open(p)} className="p-2"><Pencil className="h-4 w-4" /></button>
                <button aria-label="Delete" onClick={() => confirm(`Delete ${p.name}?`) && run(() => api(`/admin/finance-partners/${p._id}`, { method: 'DELETE' }))} className="p-2 text-panther-red"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
