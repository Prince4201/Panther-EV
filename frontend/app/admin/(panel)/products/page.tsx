'use client';
import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Trash2, X } from 'lucide-react';
import { VehicleCategories, type AdminCategory } from '@/components/admin/VehicleCategories';
import { api, ApiError } from '@/lib/api';
import { useAdmin } from '@/components/admin/AdminContext';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ActiveBadge, Card, Empty, ErrorNote, Forbidden, Loading, PageTitle, TableWrap, Td, Th, btn, btnLine, input } from '@/components/admin/ui';

interface Spec { label: string; value: string | null }
interface Product { _id: string; slug: string; name: string; category: string; tag: string; summary: string; description: string; image: string; imagePublicId?: string; gallery: Array<{ url: string; publicId?: string }>; specs: Spec[]; price: number | null; active: boolean }
type Form = Omit<Product, '_id' | 'price'> & { price: string };
const blank: Form = { slug: '', name: '', category: '', tag: '', summary: '', description: '', image: '', imagePublicId: '', gallery: [], specs: ['Range', 'Battery', 'Motor', 'Payload', 'Charging', 'Warranty'].map((label) => ({ label, value: '' })), price: '', active: true };
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function ProductsAdmin() {
  const { can } = useAdmin();
  const [list, setList] = useState<Product[] | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [cats, setCats] = useState<AdminCategory[] | null>(null);
  const canVehicles = can('products.manage');
  const canCategories = can('vehicle_categories.manage');

  const load = useCallback(() => api<{ products: Product[] }>('/admin/products').then((r) => setList(r.products)).catch((e: ApiError) => setErr(e.message)), []);
  // Categories live in the database (Vehicle categories section below); nothing here is a fixed list.
  const loadCats = useCallback(() => api<{ categories: AdminCategory[] }>('/admin/categories').then((r) => setCats(r.categories)).catch((e: ApiError) => setErr(e.message)), []);
  useEffect(() => { if (canVehicles) load(); }, [load, canVehicles]);
  useEffect(() => { if (canVehicles || canCategories) loadCats(); }, [loadCats, canVehicles, canCategories]);
  if (!canVehicles && !canCategories) return <Forbidden />;
  // An admin who may only manage categories sees just that section.
  if (!canVehicles) return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Vehicles" sub="You can manage vehicle categories. Ask the Super Admin for access to vehicles." />
      {err && <div className="mb-4"><ErrorNote>{err}</ErrorNote></div>}
      <VehicleCategories categories={cats} canManage onChanged={loadCats} />
    </div>
  );

  const activeCats = (cats ?? []).filter((c) => c.active);
  const catName = (key: string) => cats?.find((c) => c.key === key)?.name ?? key;
  // The dropdown offers every active category, plus the vehicle's current one if that was deactivated later.
  const options = (current: string) => { const cur = cats?.find((c) => c.key === current); return cur && !cur.active ? [...activeCats, cur] : activeCats; };

  const run = async (fn: () => Promise<unknown>) => { setErr(''); try { await fn(); await load(); } catch (e) { setErr(e instanceof ApiError ? e.message : 'Something went wrong.'); } };
  const open = (p?: Product) => { setErrs({}); setErr(''); setEditId(p?._id ?? null); setSlugTouched(!!p); setForm(p ? { ...p, price: p.price == null ? '' : String(p.price), specs: p.specs.map((s) => ({ label: s.label, value: s.value ?? '' })), gallery: p.gallery ?? [] } : { ...blank, category: activeCats[0]?.key ?? '', specs: blank.specs.map((s) => ({ ...s })) }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const local: Record<string, string> = {};
    if (!form.name.trim()) local.name = 'Add a name';
    if (!form.slug) local.slug = 'Add a URL name';
    if (!form.category) local.category = 'Choose a category';
    setErrs(local);
    if (Object.keys(local).length) return;
    setBusy(true); setErr('');
    // Only the fields the API accepts (it rejects unknown ones such as _id or createdAt from a loaded vehicle).
    const { slug, name, category, tag, summary, description, image, imagePublicId, active } = form;
    const body = { slug, name, category, tag, summary, description, image, imagePublicId: imagePublicId ?? '', active, price: form.price === '' ? null : Number(form.price), specs: form.specs.filter((s) => s.label.trim()).map((s) => ({ label: s.label.trim(), value: s.value?.trim() ? s.value.trim() : null })), gallery: form.gallery.filter((g) => g.url).map((g) => ({ url: g.url, publicId: g.publicId ?? '' })) };
    try { await api(editId ? `/admin/products/${editId}` : '/admin/products', { method: editId ? 'PUT' : 'POST', body: JSON.stringify(body) }); setForm(null); setEditId(null); await load(); }
    catch (er) { if (er instanceof ApiError) { setErrs(er.fieldErrors ?? {}); setErr(er.message); } else setErr('Could not save.'); }
    finally { setBusy(false); }
  };
  const fe = (k: string) => errs[k] && <span role="alert" className="mt-1 block text-sm font-normal text-panther-red">{errs[k]}</span>;

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Vehicles" sub="Add, edit, hide or delete Panther vehicles." action={!form && <button className={btn} onClick={() => open()}><Plus className="h-4 w-4" aria-hidden />Add vehicle</button>} />
      {err && <div className="mb-4"><ErrorNote>{err}</ErrorNote></div>}

      {form && (
        <Card title={editId ? 'Edit vehicle' : 'Add vehicle'} className="mb-6">
          <form onSubmit={save} noValidate className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold">Name<input value={form.name} maxLength={120} onChange={(e) => { set('name', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)); }} className={`${input} mt-1.5 font-normal`} />{fe('name')}</label>
            <label className="block text-sm font-semibold">URL name<input value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} className={`${input} mt-1.5 font-normal`} />{fe('slug')}</label>
            <label className="block text-sm font-semibold">Category
              <select value={form.category} onChange={(e) => set('category', e.target.value)} disabled={!cats} className={`${input} mt-1.5 font-normal`}>
                {!form.category && <option value="">{cats ? 'Choose a category…' : 'Loading categories…'}</option>}
                {options(form.category).map((c) => <option key={c.key} value={c.key}>{c.name}{c.active ? '' : ' (deactivated)'}</option>)}
              </select>
              {cats && activeCats.length === 0 && <span className="mt-1 block text-xs font-normal text-steel">No active categories yet. Add one under “Vehicle categories” below.</span>}
              {fe('category')}
            </label>
            <label className="block text-sm font-semibold">Tag<input value={form.tag} maxLength={40} onChange={(e) => set('tag', e.target.value)} placeholder="e.g. Heavy Duty" className={`${input} mt-1.5 font-normal`} /></label>
            <label className="block text-sm font-semibold md:col-span-2">One-line summary<input value={form.summary} maxLength={300} onChange={(e) => set('summary', e.target.value)} className={`${input} mt-1.5 font-normal`} /></label>
            <label className="block text-sm font-semibold md:col-span-2">Description<textarea rows={4} value={form.description} maxLength={4000} onChange={(e) => set('description', e.target.value)} className={`${input} mt-1.5 font-normal`} /></label>
            <label className="block text-sm font-semibold">Price (₹) <span className="font-normal text-steel">— blank shows “Contact Panther”</span><input type="number" min={0} value={form.price} onChange={(e) => set('price', e.target.value)} className={`${input} mt-1.5 font-normal`} />{fe('price')}</label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4 accent-[#E4202B]" />Active (visible on the website)</label>
            <div className="md:col-span-2"><ImageUploader label="Main image" folder="products" value={form.image} onChange={(url, id) => setForm((f) => (f ? { ...f, image: url, imagePublicId: id ?? '' } : f))} />{fe('image')}</div>
            <div className="space-y-3 md:col-span-2">
              <p className="text-sm font-semibold">More images</p>
              {form.gallery.map((g, i) => (
                <div key={i} className="flex items-start gap-3"><div className="min-w-0 flex-1"><ImageUploader label={`Image ${i + 2}`} folder="products" value={g.url} onChange={(url, id) => setForm((f) => (f ? { ...f, gallery: f.gallery.map((x, j) => (j === i ? { url, publicId: id ?? '' } : x)) } : f))} /></div><button type="button" aria-label="Remove image" onClick={() => setForm((f) => (f ? { ...f, gallery: f.gallery.filter((_, j) => j !== i) } : f))} className="p-2"><X className="h-4 w-4" /></button></div>
              ))}
              {form.gallery.length < 10 && <button type="button" className={btnLine} onClick={() => setForm((f) => (f ? { ...f, gallery: [...f.gallery, { url: '', publicId: '' }] } : f))}>Add another image</button>}
            </div>
            <fieldset className="md:col-span-2"><legend className="mb-2 text-sm font-semibold">Specifications <span className="font-normal text-steel">— blank values show “Contact Panther for details”</span></legend>
              <div className="space-y-2">
                {form.specs.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                    <input aria-label="Spec name" value={s.label} onChange={(e) => setForm((f) => (f ? { ...f, specs: f.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) } : f))} className={input} />
                    <input aria-label="Spec value" value={s.value ?? ''} onChange={(e) => setForm((f) => (f ? { ...f, specs: f.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) } : f))} className={input} />
                    <button type="button" aria-label="Remove spec" onClick={() => setForm((f) => (f ? { ...f, specs: f.specs.filter((_, j) => j !== i) } : f))} className="p-2"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              <button type="button" className={`${btnLine} mt-3`} onClick={() => setForm((f) => (f ? { ...f, specs: [...f.specs, { label: '', value: '' }] } : f))}>Add specification</button>
            </fieldset>
            <div className="flex gap-3 md:col-span-2"><button disabled={busy} className={btn}>{busy ? 'Saving…' : 'Save vehicle'}</button><button type="button" className={btnLine} onClick={() => { setForm(null); setEditId(null); }}>Cancel</button></div>
          </form>
        </Card>
      )}

      {!list ? <Loading /> : list.length === 0 ? <Empty>No vehicles yet.</Empty> : (
        <TableWrap>
          <thead><tr><Th>Vehicle</Th><Th>Category</Th><Th>Price</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p._id}>
              <Td><div className="flex items-center gap-3"><div className="grid h-12 w-16 shrink-0 place-items-center bg-fog">{/* eslint-disable-next-line @next/next/no-img-element */}{p.image && <img src={p.image} alt="" className="max-h-full max-w-full object-contain" />}</div><div><p className="font-semibold">{p.name}</p><p className="text-xs text-steel">{p.slug}</p></div></div></Td>
              <Td className="whitespace-nowrap">{catName(p.category)}</Td>
              <Td className="whitespace-nowrap">{p.price == null ? 'Contact' : `₹${p.price.toLocaleString('en-IN')}`}</Td>
              <Td><ActiveBadge active={p.active} /></Td>
              <Td className="whitespace-nowrap text-right">
                <button aria-label={p.active ? 'Deactivate' : 'Activate'} onClick={() => run(() => api(`/admin/products/${p._id}/toggle`, { method: 'PATCH' }))} className="p-2">{p.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button aria-label="Edit" onClick={() => open(p)} className="p-2"><Pencil className="h-4 w-4" /></button>
                <button aria-label="Delete" onClick={() => confirm(`Delete ${p.name}? This cannot be undone.`) && run(() => api(`/admin/products/${p._id}`, { method: 'DELETE' }))} className="p-2 text-panther-red"><Trash2 className="h-4 w-4" /></button>
              </Td>
            </tr>
          ))}</tbody>
        </TableWrap>
      )}

      <VehicleCategories categories={cats} canManage={canCategories} onChanged={() => { loadCats(); load(); }} />
    </div>
  );
}