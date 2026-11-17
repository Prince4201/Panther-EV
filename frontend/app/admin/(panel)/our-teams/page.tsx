'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, EyeOff, Minus, Move, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAdmin } from '@/components/admin/AdminContext';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { Card, ConfirmDialog, Empty, ErrorNote, Forbidden, Loading, OkNote, PageTitle, TableWrap, Td, Th, btn, btnLine, input } from '@/components/admin/ui';
import { IMAGE_POS, IMAGE_SCALE, imagePosOf, imageScaleOf, imageStyle, type TeamMember } from '@/types/team';

type Form = { name: string; designation: string; email: string; image: string; imagePublicId: string; imageScale: number; imagePosX: number; imagePosY: number; description: string; experience: string; additionalInfo: string; displayOrder: string; isVisible: boolean };
const blank: Form = { name: '', designation: '', email: '', image: '', imagePublicId: '', imageScale: 100, imagePosX: 0, imagePosY: 0, description: '', experience: '', additionalInfo: '', displayOrder: '', isVisible: true };
const label = 'block text-sm font-semibold';
const field = `${input} mt-1.5 font-normal`;
const posBtn = 'grid h-10 w-10 place-items-center border border-ink hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink';
const optional = <span className="font-normal text-steel"> (optional)</span>;

/** Admin > Our Teams: the people shown on the public /our-teams page. (Staff sign-in accounts are under "Team".) */
export default function OurTeamsAdmin() {
  const { can } = useAdmin();
  const allowed = can('ourteam.manage');
  const [list, setList] = useState<TeamMember[] | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState<TeamMember | null>(null);

  const load = useCallback(() => api<{ members: TeamMember[] }>('/admin/team-members').then((r) => setList(r.members)).catch((e: ApiError) => setErr(e.message)), []);
  useEffect(() => { if (allowed) load(); }, [load, allowed]);
  if (!allowed) return <Forbidden />;

  const run = async (fn: () => Promise<unknown>, done = '') => { setErr(''); setOk(''); try { await fn(); await load(); if (done) setOk(done); } catch (e) { setErr(e instanceof ApiError ? e.message : 'Something went wrong.'); } };
  const move = (i: number, by: number) => { if (!list) return; const ids = list.map((m) => m._id); [ids[i], ids[i + by]] = [ids[i + by], ids[i]]; run(() => api('/admin/team-members/reorder', { method: 'PUT', body: JSON.stringify({ ids }) })); };
  const open = (m?: TeamMember) => {
    setErrs({}); setErr(''); setOk(''); setEditId(m?._id ?? null);
    setForm(m ? { name: m.name, designation: m.designation, email: m.email, image: m.image, imagePublicId: m.imagePublicId ?? '', imageScale: imageScaleOf(m), imagePosX: imagePosOf(m.imagePosX), imagePosY: imagePosOf(m.imagePosY), description: m.description, experience: m.experience, additionalInfo: m.additionalInfo, displayOrder: String(m.displayOrder ?? ''), isVisible: m.isVisible } : { ...blank });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const close = () => { setForm(null); setEditId(null); setErrs({}); };
  const set = <K extends keyof Form>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => (f ? { ...f, [k]: e.target.value } : f));
  const setScale = (n: number) => setForm((f) => (f ? { ...f, imageScale: Math.min(IMAGE_SCALE.max, Math.max(IMAGE_SCALE.min, Math.round(n))) } : f));

  // Position: how far the photo is moved from the centre, in percent of its frame.
  const clampPos = (n: number) => Math.round(Math.min(IMAGE_POS.max, Math.max(IMAGE_POS.min, n)) * 10) / 10;
  const nudge = (dx: number, dy: number) => setForm((f) => (f ? { ...f, imagePosX: clampPos(f.imagePosX + dx), imagePosY: clampPos(f.imagePosY + dy) } : f));
  const centre = () => setForm((f) => (f ? { ...f, imagePosX: 0, imagePosY: 0 } : f));
  // Dragging the photo in the preview moves it. The start point and the frame size are remembered for the whole drag.
  const drag = useRef<{ x: number; y: number; px: number; py: number; w: number; h: number } | null>(null);
  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    const frame = (e.target as HTMLElement).closest('[data-photo-frame]');
    if (!frame || !form?.image) return;
    const r = frame.getBoundingClientRect();
    drag.current = { x: e.clientX, y: e.clientY, px: form.imagePosX, py: form.imagePosY, w: r.width, h: r.height };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const x = clampPos(d.px + ((e.clientX - d.x) / d.w) * 100);
    const y = clampPos(d.py + ((e.clientY - d.y) / d.h) * 100);
    setForm((f) => (f ? { ...f, imagePosX: x, imagePosY: y } : f));
  };
  const onDragEnd = () => { drag.current = null; };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || busy) return;
    const local: Record<string, string> = {};
    // Everything is optional, but a completely empty card is not saved.
    if (!form.name.trim() && !form.designation.trim() && !form.image) local.name = 'Add at least a name, a role or a photo';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) local.email = 'Enter a valid email';
    if (form.displayOrder !== '' && (!/^\d+$/.test(form.displayOrder) || Number(form.displayOrder) > 9999)) local.displayOrder = 'Use a whole number from 0 to 9999';
    setErrs(local); setErr(''); setOk('');
    if (Object.keys(local).length) return;
    setBusy(true);
    const { displayOrder, ...rest } = form;
    const body = { ...rest, name: form.name.trim(), designation: form.designation.trim(), email: form.email.trim(), ...(displayOrder === '' ? {} : { displayOrder: Number(displayOrder) }) };
    try {
      await api(editId ? `/admin/team-members/${editId}` : '/admin/team-members', { method: editId ? 'PUT' : 'POST', body: JSON.stringify(body) });
      const who = body.name || body.designation || 'Team member';
      close(); await load(); setOk(editId ? `${who} updated.` : `${who} added.`);
    } catch (er) { if (er instanceof ApiError) { setErrs(er.fieldErrors ?? {}); setErr(er.status === 0 ? 'Unable to save. Please check your connection and try again.' : er.message); } else setErr('Could not save.'); }
    finally { setBusy(false); }
  };
  const fe = (k: string) => errs[k] && <span role="alert" className="mt-1 block text-sm font-normal text-panther-red">{errs[k]}</span>;
  const preview: TeamMember = { _id: 'preview', name: form?.name ?? '', designation: form?.designation ?? '', email: form?.email ?? '', image: form?.image ?? '', imageScale: form?.imageScale, imagePosX: form?.imagePosX, imagePosY: form?.imagePosY, description: form?.description ?? '', experience: form?.experience ?? '', additionalInfo: form?.additionalInfo ?? '', displayOrder: 0, isVisible: true };

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Our Teams" sub="The people shown on the public Our Teams page. Every field is optional; hidden members appear nowhere." action={!form && <button className={btn} onClick={() => open()}><Plus className="h-4 w-4" aria-hidden />Add team member</button>} />
      {err && <div className="mb-4"><ErrorNote>{err}</ErrorNote></div>}
      {ok && <div className="mb-4"><OkNote>{ok}</OkNote></div>}

      {form && (
        <Card title={editId ? 'Edit team member' : 'Add team member'} className="mb-6">
          <form onSubmit={save} noValidate className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="grid content-start gap-4 md:grid-cols-2">
              <label className={label}>Name{optional}<input value={form.name} onChange={set('name')} maxLength={120} className={field} />{fe('name')}</label>
              <label className={label}>Designation / role{optional}<input value={form.designation} onChange={set('designation')} maxLength={120} placeholder="e.g. Director, Sales Manager" className={field} />{fe('designation')}</label>
              <label className={`${label} md:col-span-2`}>Email{optional}<input type="email" value={form.email} onChange={set('email')} maxLength={120} className={field} /><span className="mt-1 block text-xs font-normal text-steel">Shown on the public page if you fill it in.</span>{fe('email')}</label>
              <div className="md:col-span-2"><ImageUploader label="Profile image (optional)" folder="team" value={form.image} onChange={(url, id) => setForm((f) => (f ? { ...f, image: url, imagePublicId: id ?? '' } : f))} hint="JPG, PNG, WebP or AVIF, or paste a link. The photo is shown whole, never stretched." />{fe('image')}</div>

              {/* Image size: display only. The uploaded file is not changed, cropped or stretched. */}
              <div className="md:col-span-2">
                <p className="mb-1.5 text-sm font-semibold">Image size</p>
                <div className="flex items-center gap-3">
                  <button type="button" aria-label="Make the image smaller" disabled={form.imageScale <= IMAGE_SCALE.min} onClick={() => setScale(form.imageScale - IMAGE_SCALE.step)} className="grid h-10 w-10 shrink-0 place-items-center border border-ink hover:bg-ink hover:text-white disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                  <input type="range" aria-label="Image size in percent" min={IMAGE_SCALE.min} max={IMAGE_SCALE.max} step={IMAGE_SCALE.step} value={form.imageScale} onChange={(e) => setScale(Number(e.target.value))} className="h-2 min-w-0 flex-1 cursor-pointer accent-[#E4202B]" />
                  <button type="button" aria-label="Make the image bigger" disabled={form.imageScale >= IMAGE_SCALE.max} onClick={() => setScale(form.imageScale + IMAGE_SCALE.step)} className="grid h-10 w-10 shrink-0 place-items-center border border-ink hover:bg-ink hover:text-white disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                  <output className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums">{form.imageScale}%</output>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-steel">
                  <button type="button" onClick={() => setScale(IMAGE_SCALE.base)} disabled={form.imageScale === IMAGE_SCALE.base} className="font-semibold text-panther-red hover:text-ink disabled:text-steel disabled:opacity-60">Reset to 100%</button>
                  <span>{IMAGE_SCALE.min}% to {IMAGE_SCALE.max}%. Only the displayed size changes; the original image is not modified.</span>
                </div>
                {fe('imageScale')}
              </div>

              {/* Image position: moves the photo inside its frame. Display only, like the size. */}
              <div className="md:col-span-2">
                <p className="mb-1.5 text-sm font-semibold">Image position</p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="grid grid-cols-3 gap-1" role="group" aria-label="Move the photo">
                    <span />
                    <button type="button" aria-label="Move up" disabled={!form.image || form.imagePosY <= IMAGE_POS.min} onClick={() => nudge(0, -IMAGE_POS.step)} className={posBtn}><ArrowUp className="h-4 w-4" /></button>
                    <span />
                    <button type="button" aria-label="Move left" disabled={!form.image || form.imagePosX <= IMAGE_POS.min} onClick={() => nudge(-IMAGE_POS.step, 0)} className={posBtn}><ArrowLeft className="h-4 w-4" /></button>
                    <button type="button" aria-label="Centre the photo" title="Centre" disabled={!form.image || (!form.imagePosX && !form.imagePosY)} onClick={centre} className={posBtn}><Move className="h-4 w-4" /></button>
                    <button type="button" aria-label="Move right" disabled={!form.image || form.imagePosX >= IMAGE_POS.max} onClick={() => nudge(IMAGE_POS.step, 0)} className={posBtn}><ArrowRight className="h-4 w-4" /></button>
                    <span />
                    <button type="button" aria-label="Move down" disabled={!form.image || form.imagePosY >= IMAGE_POS.max} onClick={() => nudge(0, IMAGE_POS.step)} className={posBtn}><ArrowDown className="h-4 w-4" /></button>
                    <span />
                  </div>
                  <div className="min-w-0 flex-1 text-xs text-steel">
                    <p className="text-sm text-ink">You can also <strong>drag the photo in the preview</strong> to place it.</p>
                    <p className="mt-1">Zoom in first if you want to choose which part of the photo shows. The original image is not modified or cropped.</p>
                    <p className="mt-2 tabular-nums">Left / right: {form.imagePosX}% · Up / down: {form.imagePosY}% <button type="button" onClick={centre} disabled={!form.imagePosX && !form.imagePosY} className="ml-3 font-semibold text-panther-red hover:text-ink disabled:text-steel disabled:opacity-60">Centre</button></p>
                  </div>
                </div>
                {fe('imagePosX')}{fe('imagePosY')}
              </div>

              <label className={`${label} md:col-span-2`}>Description{optional}<textarea rows={3} value={form.description} onChange={set('description')} maxLength={1000} className={field} />{fe('description')}</label>
              <label className={label}>Experience{optional}<input value={form.experience} onChange={set('experience')} maxLength={120} placeholder="e.g. 10+ years" className={field} />{fe('experience')}</label>
              <label className={label}>Display order<input type="number" min={0} max={9999} value={form.displayOrder} onChange={set('displayOrder')} placeholder={editId ? '' : 'Last'} className={field} /><span className="mt-1 block text-xs font-normal text-steel">Lower numbers come first.</span>{fe('displayOrder')}</label>
              <label className={`${label} md:col-span-2`}>Additional information{optional}<textarea rows={2} value={form.additionalInfo} onChange={set('additionalInfo')} maxLength={1000} className={field} />{fe('additionalInfo')}</label>
              <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={form.isVisible} onChange={(e) => setForm((f) => (f ? { ...f, isVisible: e.target.checked } : f))} className="h-4 w-4 accent-[#E4202B]" />Show on website</label>
              <div className="flex gap-3 md:col-span-2"><button disabled={busy} className={btn}>{busy ? 'Saving…' : 'Save'}</button><button type="button" className={btnLine} onClick={close}>Cancel</button></div>
            </div>
            <div>
              <p className="mb-1 text-xs text-steel">Preview (as on the Our Teams page){form.image ? ' · drag the photo to move it' : ''}</p>
              {/* touch-action none on the photo so a finger drag moves the photo instead of scrolling the page. */}
              <div onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerCancel={onDragEnd} className={form.image ? '[&_[data-photo-frame]]:cursor-move [&_[data-photo-frame]]:touch-none [&_[data-photo-frame]]:select-none' : undefined}>
                <TeamMemberCard member={preview} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <button type="button" onClick={() => setScale(IMAGE_SCALE.base)} disabled={form.imageScale === IMAGE_SCALE.base} className="font-semibold text-panther-red hover:text-ink disabled:text-steel disabled:opacity-60">Reset size</button>
                <button type="button" onClick={centre} disabled={!form.imagePosX && !form.imagePosY} className="font-semibold text-panther-red hover:text-ink disabled:text-steel disabled:opacity-60">Centre photo</button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {!list ? <Loading /> : list.length === 0 ? <Empty>No team members yet. Add the first one.</Empty> : (
        <TableWrap>
          <thead><tr><Th>Image</Th><Th>Name</Th><Th>Designation</Th><Th>Visible</Th><Th>Order</Th><Th>Actions</Th></tr></thead>
          <tbody>{list.map((m, i) => (
            <tr key={m._id} className={m.isVisible ? undefined : 'bg-fog/50'}>
              <Td><div className="grid h-16 w-14 place-items-center overflow-hidden bg-fog">{/* eslint-disable-next-line @next/next/no-img-element */}{m.image ? <img src={m.image} alt="" style={imageStyle(m)} className="h-full w-full object-contain" /> : <span className="text-[10px] text-steel">No photo</span>}</div></Td>
              <Td className="max-w-[240px]"><p className="font-semibold">{m.name || <span className="font-normal text-steel">No name</span>}</p>{m.email && <p className="break-all text-xs text-steel">{m.email}</p>}</Td>
              <Td>{m.designation || <span className="text-steel">–</span>}</Td>
              <Td>{m.isVisible ? 'Yes' : <span className="text-steel">Hidden</span>}</Td>
              <Td>{m.displayOrder}</Td>
              <Td className="whitespace-nowrap">
                <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="p-2 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                <button aria-label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)} className="p-2 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                <button aria-label={m.isVisible ? 'Hide from website' : 'Show on website'} onClick={() => run(() => api(`/admin/team-members/${m._id}/toggle`, { method: 'PATCH' }))} className="p-2">{m.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button aria-label="Edit" onClick={() => open(m)} className="p-2"><Pencil className="h-4 w-4" /></button>
                <button aria-label="Delete" onClick={() => setDel(m)} className="p-2 text-panther-red"><Trash2 className="h-4 w-4" /></button>
              </Td>
            </tr>
          ))}</tbody>
        </TableWrap>
      )}

      {del && (
        <ConfirmDialog title="Delete team member" confirmLabel="Delete" danger onCancel={() => setDel(null)} onConfirm={() => { const m = del; setDel(null); if (editId === m._id) close(); run(() => api(`/admin/team-members/${m._id}`, { method: 'DELETE' }), `${m.name || m.designation || 'Team member'} deleted.`); }}>
          <p>Delete <strong>{del.name || del.designation || 'this team member'}</strong> from Our Teams?</p>
          <p>This cannot be undone. To take them off the website but keep the details, use Hide instead.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}
