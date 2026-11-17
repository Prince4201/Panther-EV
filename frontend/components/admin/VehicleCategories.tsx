'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ApiError, api } from '@/lib/api';
import { ActiveBadge, ConfirmDialog, Empty, ErrorNote, Loading, Modal, OkNote, TableWrap, Td, Th, btn, btnLine, input } from '@/components/admin/ui';

export interface AdminCategory { _id: string; name: string; key: string; slug: string; description: string; active: boolean; displayOrder: number; vehicleCount: number }
type Form = { name: string; description: string; active: boolean; displayOrder: string };
type Dialog = { kind: 'form'; c: AdminCategory | null } | { kind: 'delete'; c: AdminCategory } | { kind: 'toggle'; c: AdminCategory } | null;

const label = 'block text-sm font-semibold';
const field = `${input} mt-1.5 font-normal`;
const inUse = (n: number) => `This category is currently being used by ${n} vehicle${n === 1 ? '' : 's'}.`;

/**
 * Vehicle categories (Admin > Vehicles). Stored in MongoDB through /admin/categories; the vehicle form's dropdown
 * and the public site read the same records. `canManage` only decides which buttons are drawn:
 * the API checks the "vehicle_categories.manage" permission on every write.
 */
export function VehicleCategories({ categories, canManage, onChanged }: { categories: AdminCategory[] | null; canManage: boolean; onChanged: () => void }) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [form, setForm] = useState<Form>({ name: '', description: '', active: true, displayOrder: '' });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [dialogErr, setDialogErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => { setDialog(null); setErrs({}); setDialogErr(''); setBusy(false); };
  const openForm = (c: AdminCategory | null) => {
    setOk(''); setErrs({}); setDialogErr('');
    setForm(c ? { name: c.name, description: c.description, active: c.active, displayOrder: String(c.displayOrder) } : { name: '', description: '', active: true, displayOrder: '' });
    setDialog({ kind: 'form', c });
  };
  const submit = async (call: () => Promise<unknown>, done: string) => {
    setBusy(true); setDialogErr(''); setErrs({});
    try { await call(); close(); setOk(done); onChanged(); }
    catch (e) {
      if (e instanceof ApiError) { setErrs(e.fieldErrors ?? {}); setDialogErr(e.status === 0 ? 'Unable to save. Please check your connection and try again.' : e.message); }
      else setDialogErr('Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialog?.kind !== 'form') return;
    const local: Record<string, string> = {};
    if (form.name.trim().length < 2) local.name = 'Add the category name';
    if (form.displayOrder !== '' && (!/^\d+$/.test(form.displayOrder) || Number(form.displayOrder) > 9999)) local.displayOrder = 'Use a whole number from 0 to 9999';
    setErrs(local);
    if (Object.keys(local).length) return;
    const body = { name: form.name.trim(), description: form.description.trim(), active: form.active, ...(form.displayOrder === '' ? {} : { displayOrder: Number(form.displayOrder) }) };
    const c = dialog.c;
    submit(() => api(c ? `/admin/categories/${c._id}` : '/admin/categories', { method: c ? 'PUT' : 'POST', body: JSON.stringify(body) }), c ? `Category “${body.name}” updated.` : `Category “${body.name}” added. It is now available in the vehicle form.`);
  };
  const toggle = () => dialog?.kind === 'toggle' && submit(() => api(`/admin/categories/${dialog.c._id}/toggle`, { method: 'PATCH' }), dialog.c.active ? `“${dialog.c.name}” deactivated. Its vehicles are unchanged.` : `“${dialog.c.name}” activated.`);
  const remove = () => dialog?.kind === 'delete' && submit(() => api(`/admin/categories/${dialog.c._id}`, { method: 'DELETE' }), `Category “${dialog.c.name}” deleted.`);

  const fe = (k: string) => errs[k] && <span role="alert" className="mt-1 block text-sm font-normal text-panther-red">{errs[k]}</span>;
  const action = 'px-2 py-1.5 text-xs font-semibold hover:bg-fog';

  return (
    <section aria-labelledby="vehicle-categories" className="mt-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="vehicle-categories" className="font-display text-3xl leading-none md:text-4xl">Vehicle categories</h2>
          <p className="mt-2 text-sm text-steel">{canManage ? 'Add as many categories as you need. Active categories appear in the vehicle form and on the website.' : 'You can see the categories. Changing them needs the “Vehicle categories” permission.'}</p>
        </div>
        {canManage && <button type="button" className={btn} onClick={() => openForm(null)}><Plus className="h-4 w-4" aria-hidden />Add category</button>}
      </div>
      {ok && <div className="mb-4"><OkNote>{ok}</OkNote></div>}

      {!categories ? <Loading /> : categories.length === 0 ? <Empty>No categories yet.{canManage ? ' Add your first category.' : ''}</Empty> : (
        <TableWrap>
          <thead><tr><Th>Category name</Th><Th>Vehicles</Th><Th>Order</Th><Th>Status</Th>{canManage && <Th>Actions</Th>}</tr></thead>
          <tbody>{categories.map((c) => (
            <tr key={c._id} className={c.active ? undefined : 'bg-fog/50'}>
              <Td className="max-w-[360px]"><p className="font-semibold">{c.name}</p>{c.description && <p className="mt-0.5 text-xs text-steel">{c.description}</p>}<p className="mt-0.5 text-xs text-steel">/vehicles/{c.slug}</p></Td>
              <Td>{c.vehicleCount}</Td>
              <Td>{c.displayOrder}</Td>
              <Td><ActiveBadge active={c.active} /></Td>
              {canManage && (
                <Td className="whitespace-nowrap">
                  <button type="button" className={action} onClick={() => openForm(c)}>Edit</button>
                  <button type="button" className={action} onClick={() => { setOk(''); setDialogErr(''); setDialog({ kind: 'toggle', c }); }}>{c.active ? 'Deactivate' : 'Activate'}</button>
                  <button type="button" className={`${action} text-panther-red hover:bg-red-50`} onClick={() => { setOk(''); setDialogErr(''); setDialog({ kind: 'delete', c }); }}>Delete</button>
                </Td>
              )}
            </tr>
          ))}</tbody>
        </TableWrap>
      )}

      {dialog?.kind === 'form' && (
        <Modal title={dialog.c ? 'Edit category' : 'Add category'} onClose={close}>
          <form onSubmit={save} noValidate className="space-y-4">
            <label className={label}>Category name<input value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Electric Scooter" className={field} />{fe('name')}</label>
            <label className={label}>Category description<textarea rows={3} value={form.description} maxLength={400} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Shown under the category title on the website." className={field} />{fe('description')}</label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>Status<select value={form.active ? '1' : '0'} onChange={(e) => setForm({ ...form, active: e.target.value === '1' })} className={field}><option value="1">Active</option><option value="0">Inactive</option></select></label>
              <label className={label}>Display order<input type="number" min={0} max={9999} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} placeholder={dialog.c ? '' : 'Last'} className={field} /><span className="mt-1 block text-xs font-normal text-steel">Lower numbers come first.</span>{fe('displayOrder')}</label>
            </div>
            {dialog.c && <p className="text-xs text-steel">Renaming keeps the web address (/vehicles/{dialog.c.slug}) and every vehicle in this category.</p>}
            {dialogErr && <ErrorNote>{dialogErr}</ErrorNote>}
            <div className="flex flex-wrap justify-end gap-3"><button type="button" className={btnLine} onClick={close}>Cancel</button><button disabled={busy} className={btn}>{busy ? 'Saving…' : dialog.c ? 'Save changes' : 'Add category'}</button></div>
          </form>
        </Modal>
      )}

      {dialog?.kind === 'toggle' && (
        <ConfirmDialog title={dialog.c.active ? 'Deactivate category' : 'Activate category'} confirmLabel={dialog.c.active ? 'Deactivate' : 'Activate'} busy={busy} onConfirm={toggle} onCancel={close}>
          {dialog.c.active
            ? <><p>Deactivate <strong>{dialog.c.name}</strong>?</p><p>It is removed from the category list for new vehicles and from the website menus. {dialog.c.vehicleCount > 0 ? `Its ${dialog.c.vehicleCount} vehicle${dialog.c.vehicleCount === 1 ? '' : 's'} stay visible and keep this category.` : 'Nothing else changes.'}</p></>
            : <p>Activate <strong>{dialog.c.name}</strong>? It becomes available for new vehicles and appears on the website again.</p>}
          {dialogErr && <ErrorNote>{dialogErr}</ErrorNote>}
        </ConfirmDialog>
      )}

      {dialog?.kind === 'delete' && (dialog.c.vehicleCount > 0 ? (
        <Modal title="Category in use" onClose={close}>
          <div className="space-y-2 text-sm">
            <p>{inUse(dialog.c.vehicleCount)}</p>
            <p>Please reassign {dialog.c.vehicleCount === 1 ? 'that vehicle' : 'those vehicles'} to another category before deleting it.</p>
            <p className="text-steel">To stop it being used for new vehicles while keeping the existing ones, deactivate it instead.</p>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" className={btnLine} onClick={close}>Close</button>
            {dialog.c.active && <button type="button" className={btn} onClick={() => setDialog({ kind: 'toggle', c: dialog.c })}>Deactivate instead</button>}
          </div>
        </Modal>
      ) : (
        <ConfirmDialog title="Delete category" confirmLabel="Delete" danger busy={busy} onConfirm={remove} onCancel={close}>
          <p>Delete <strong>{dialog.c.name}</strong>? No vehicles use it. This cannot be undone.</p>
          {dialogErr && <ErrorNote>{dialogErr}</ErrorNote>}
        </ConfirmDialog>
      ))}
    </section>
  );
}
