'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { KeyRound, Pencil, Power, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAdmin } from '@/components/admin/AdminContext';
import { ActiveBadge, Avatar, ConfirmDialog, ErrorNote, Forbidden, Loading, Modal, OkNote, PageTitle, RoleBadge, Stat, TableWrap, Td, Th, btn, btnLine, input } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { fmtDate } from '@/lib/enquiry';
import { PERMISSION_LABELS, PermissionPicker } from '@/components/admin/PermissionPicker';
import { checkPassword, passwordRules } from '@/components/account/ChangePasswordForm';

interface Member { id: string; name: string; email: string; phone: string; avatar: string; role: 'super_admin' | 'admin'; permissions: string[]; active: boolean; lastLoginAt?: string; createdAt: string; openEnquiries: number; totalAssigned: number; completed: number }
type Details = { name: string; email: string; phone: string; avatar: string; active: boolean };
type Dialog =
  | { kind: 'add' }
  | { kind: 'edit'; m: Member }
  | { kind: 'perms'; m: Member }
  | { kind: 'password'; m: Member }
  | { kind: 'status'; m: Member }
  | { kind: 'remove'; m: Member }
  | null;

const blank = { name: '', email: '', phone: '', avatar: '', password: '', permissions: [] as string[], active: true };
const label = 'block text-sm font-semibold';
const field = `${input} mt-1.5 font-normal`;

/** A random temporary password that meets the rules (letters + numbers, no look-alike characters). */
function tempPassword() {
  const letters = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const pick = (set: string, n: number) => Array.from(crypto.getRandomValues(new Uint32Array(n)), (x) => set[x % set.length]).join('');
  return `${pick(letters, 5)}-${pick(digits, 4)}-${pick(letters, 4)}`;
}

function PermissionChips({ m }: { m: Member }) {
  if (m.role === 'super_admin') return <span className="text-xs font-semibold">Full access</span>;
  if (!m.permissions.length) return <span className="text-xs text-steel">Assigned enquiries only</span>;
  return <span className="flex flex-wrap gap-1">{m.permissions.map((p) => <span key={p} className="whitespace-nowrap bg-fog px-2 py-0.5 text-xs">{PERMISSION_LABELS[p] ?? p}</span>)}</span>;
}

export default function TeamPage() {
  const { admin: me, isSuper } = useAdmin();
  const [list, setList] = useState<Member[] | null>(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [form, setForm] = useState(blank);
  const [details, setDetails] = useState<Details>({ name: '', email: '', phone: '', avatar: '', active: true });
  const [perms, setPerms] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [dialogErr, setDialogErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api<{ admins: Member[] }>('/admin/team').then((r) => setList(r.admins)).catch((e: ApiError) => setErr(e.message)), []);
  useEffect(() => { if (isSuper) load(); }, [load, isSuper]);
  const close = useCallback(() => { setDialog(null); setErrs({}); setDialogErr(''); setBusy(false); }, []);
  if (!isSuper) return <Forbidden />;

  const open = (d: NonNullable<Dialog>) => {
    setErrs({}); setDialogErr(''); setOk(''); setErr('');
    if (d.kind === 'add') setForm({ ...blank, permissions: [] });
    if (d.kind === 'edit') setDetails({ name: d.m.name, email: d.m.email, phone: d.m.phone, avatar: d.m.avatar, active: d.m.active });
    if (d.kind === 'perms') setPerms(d.m.permissions);
    if (d.kind === 'password') setPassword('');
    setDialog(d);
  };

  /** Runs one API call for the open dialog; on success closes it, reloads the list and shows a confirmation. */
  const submit = async (call: () => Promise<unknown>, done: string) => {
    setBusy(true); setDialogErr(''); setErrs({});
    try { await call(); close(); setOk(done); await load(); }
    catch (er) { if (er instanceof ApiError) { setErrs(er.fieldErrors ?? {}); setDialogErr(er.message); } else setDialogErr('Something went wrong. Please try again.'); setBusy(false); }
  };
  const checkDetails = (v: { name: string; email: string }) => {
    const local: Record<string, string> = {};
    if (v.name.trim().length < 2) local.name = 'Enter a name';
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) local.email = 'Enter a valid email';
    return local;
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const local = checkDetails(form);
    const weak = checkPassword(form.password); if (weak) local.password = weak;
    setErrs(local);
    if (Object.keys(local).length) return;
    submit(() => api('/admin/team', { method: 'POST', body: JSON.stringify({ ...form, name: form.name.trim(), email: form.email.trim() }) }), `${form.name.trim()} was added. Share the temporary password privately; they must change it at first sign-in.`);
  };
  const saveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialog?.kind !== 'edit') return;
    const local = checkDetails(details);
    setErrs(local);
    if (Object.keys(local).length) return;
    submit(() => api(`/admin/team/${dialog.m.id}`, { method: 'PATCH', body: JSON.stringify({ ...details, name: details.name.trim(), email: details.email.trim() }) }), `${details.name.trim()} was updated.`);
  };
  const savePerms = () => dialog?.kind === 'perms' && submit(() => api(`/admin/team/${dialog.m.id}`, { method: 'PATCH', body: JSON.stringify({ permissions: perms }) }), `Permissions updated for ${dialog.m.name}. They apply immediately.`);
  const savePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialog?.kind !== 'password') return;
    const weak = checkPassword(password);
    if (weak) { setErrs({ password: weak }); return; }
    submit(() => api(`/admin/team/${dialog.m.id}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) }), `Password reset for ${dialog.m.name}. They were signed out and must change it at next sign-in.`);
  };
  const setStatus = () => dialog?.kind === 'status' && submit(() => api(`/admin/team/${dialog.m.id}`, { method: 'PATCH', body: JSON.stringify({ active: !dialog.m.active }) }), dialog.m.active ? `${dialog.m.name} was deactivated and signed out.` : `${dialog.m.name} was activated.`);
  const remove = () => dialog?.kind === 'remove' && submit(() => api(`/admin/team/${dialog.m.id}`, { method: 'DELETE' }), `${dialog.m.name} was removed.`);

  const fe = (k: string) => errs[k] && <span role="alert" className="mt-1 block text-sm font-normal text-panther-red">{errs[k]}</span>;
  const actionBtn = 'inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold hover:bg-fog';
  const actions = (m: Member) => m.role === 'super_admin'
    ? <span className="text-xs text-steel">{m.id === me.id ? 'Your account · edit in Profile' : 'Protected account'}</span>
    : (
      <div className="flex flex-wrap gap-1">
        <button onClick={() => open({ kind: 'edit', m })} className={actionBtn}><Pencil className="h-3.5 w-3.5" aria-hidden />Edit</button>
        <button onClick={() => open({ kind: 'perms', m })} className={actionBtn}><ShieldCheck className="h-3.5 w-3.5" aria-hidden />Permissions</button>
        <button onClick={() => open({ kind: 'status', m })} className={actionBtn}><Power className="h-3.5 w-3.5" aria-hidden />{m.active ? 'Deactivate' : 'Activate'}</button>
        <button onClick={() => open({ kind: 'password', m })} className={actionBtn}><KeyRound className="h-3.5 w-3.5" aria-hidden />Reset password</button>
        <button onClick={() => open({ kind: 'remove', m })} className={`${actionBtn} text-panther-red hover:bg-red-50`}><Trash2 className="h-3.5 w-3.5" aria-hidden />Remove</button>
      </div>
    );
  const who = (m: Member) => (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={m.name} src={m.avatar} />
      <div className="min-w-0"><Link href={`/admin/team/${m.id}`} className="block truncate font-semibold hover:text-panther-red">{m.name}</Link><p className="break-all text-xs text-steel">{m.email}</p></div>
    </div>
  );
  const passwordField = (value: string, onChange: (v: string) => void) => (
    <label className={label}>Temporary password
      <span className="mt-1.5 flex gap-2">
        <input type="text" autoComplete="off" spellCheck={false} value={value} onChange={(e) => onChange(e.target.value)} className={`${input} min-w-0 font-normal`} />
        <button type="button" className={`${btnLine} shrink-0`} onClick={() => onChange(tempPassword())}>Generate</button>
      </span>
      <span className="mt-1 block text-xs font-normal text-steel">{passwordRules} Share it privately. Only a secure hash is stored: it is never shown again and never written to the activity log.</span>
      {fe('password')}
    </label>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle title="Team" sub="Add team members, choose what each one may do, and remove access when someone leaves." action={<button className={btn} onClick={() => open({ kind: 'add' })}><UserPlus className="h-4 w-4" aria-hidden />Add team member</button>} />
      {err && <div className="mb-4"><ErrorNote>{err}</ErrorNote></div>}
      {ok && <div className="mb-4"><OkNote>{ok}</OkNote></div>}

      {!list ? <Loading /> : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <Stat label="Team members" value={list.length} />
            <Stat label="Active" value={list.filter((m) => m.active).length} />
            <Stat label="Inactive" value={list.filter((m) => !m.active).length} tone={list.some((m) => !m.active) ? 'text-steel' : undefined} />
          </div>

          {/* Wide screens: table */}
          <div className="hidden xl:block">
            <TableWrap>
              <thead><tr><Th>Name</Th><Th>Role</Th><Th>Status</Th><Th>Permissions</Th><Th>Open / total</Th><Th>Last login</Th><Th>Created</Th><Th>Actions</Th></tr></thead>
              <tbody>{list.map((m) => (
                <tr key={m.id} className={m.active ? undefined : 'bg-fog/50'}>
                  <Td className="max-w-[240px]">{who(m)}</Td>
                  <Td><RoleBadge role={m.role} /></Td>
                  <Td><ActiveBadge active={m.active} /></Td>
                  <Td className="max-w-[260px]"><PermissionChips m={m} /></Td>
                  <Td className="whitespace-nowrap">{m.openEnquiries} / {m.totalAssigned}</Td>
                  <Td className="whitespace-nowrap">{fmtDate(m.lastLoginAt)}</Td>
                  <Td className="whitespace-nowrap">{fmtDate(m.createdAt)}</Td>
                  <Td className="max-w-[300px]">{actions(m)}</Td>
                </tr>
              ))}</tbody>
            </TableWrap>
          </div>

          {/* Phones, tablets and small laptops: cards */}
          <ul className="grid gap-4 md:grid-cols-2 xl:hidden">
            {list.map((m) => (
              <li key={m.id} className="flex flex-col gap-4 bg-white p-5">
                <div className="flex items-start justify-between gap-3">{who(m)}<ActiveBadge active={m.active} /></div>
                <div className="flex flex-wrap items-center gap-2"><RoleBadge role={m.role} /><PermissionChips m={m} /></div>
                <dl className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
                  <div><dt className="text-steel">Last login</dt><dd className="font-semibold">{fmtDate(m.lastLoginAt)}</dd></div>
                  <div><dt className="text-steel">Created</dt><dd className="font-semibold">{fmtDate(m.createdAt)}</dd></div>
                  <div><dt className="text-steel">Open / total</dt><dd className="font-semibold">{m.openEnquiries} / {m.totalAssigned}</dd></div>
                </dl>
                <div className="border-t border-line pt-3">{actions(m)}</div>
              </li>
            ))}
          </ul>
        </>
      )}

      {dialog?.kind === 'add' && (
        <Modal title="Add team member" onClose={close} wide>
          <form onSubmit={create} noValidate className="grid gap-4 md:grid-cols-2">
            <label className={label}>Full name<input value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />{fe('name')}</label>
            <label className={label}>Email<input type="email" autoComplete="off" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />{fe('email')}</label>
            <label className={label}>Phone<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />{fe('phone')}</label>
            {passwordField(form.password, (password) => setForm({ ...form, password }))}
            <label className={label}>Role<select disabled value="admin" className={field}><option value="admin">Admin</option></select><span className="mt-1 block text-xs font-normal text-steel">Team members are always Admins. A Super Admin cannot be created from this form.</span></label>
            <label className={label}>Status<select value={form.active ? '1' : '0'} onChange={(e) => setForm({ ...form, active: e.target.value === '1' })} className={field}><option value="1">Active – can sign in</option><option value="0">Inactive – cannot sign in yet</option></select></label>
            <div className="md:col-span-2"><ImageUploader label="Profile photo (optional)" folder="avatars" value={form.avatar} onChange={(avatar) => setForm({ ...form, avatar })} />{fe('avatar')}</div>
            <div className="md:col-span-2"><PermissionPicker value={form.permissions} onChange={(permissions) => setForm({ ...form, permissions })} /></div>
            {dialogErr && <div className="md:col-span-2"><ErrorNote>{dialogErr}</ErrorNote></div>}
            <div className="flex flex-wrap justify-end gap-3 md:col-span-2"><button type="button" className={btnLine} onClick={close}>Cancel</button><button disabled={busy} className={btn}>{busy ? 'Adding…' : 'Add team member'}</button></div>
          </form>
        </Modal>
      )}

      {dialog?.kind === 'edit' && (
        <Modal title={`Edit ${dialog.m.name}`} onClose={close} wide>
          <form onSubmit={saveDetails} noValidate className="grid gap-4 md:grid-cols-2">
            <label className={label}>Full name<input value={details.name} maxLength={80} onChange={(e) => setDetails({ ...details, name: e.target.value })} className={field} />{fe('name')}</label>
            <label className={label}>Email<input type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} className={field} />{fe('email')}</label>
            <label className={label}>Phone<input type="tel" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} className={field} />{fe('phone')}</label>
            <label className={label}>Status<select value={details.active ? '1' : '0'} onChange={(e) => setDetails({ ...details, active: e.target.value === '1' })} className={field}><option value="1">Active</option><option value="0">Inactive – signed out, cannot sign in</option></select></label>
            <div className="md:col-span-2"><ImageUploader label="Profile photo (optional)" folder="avatars" value={details.avatar} onChange={(avatar) => setDetails({ ...details, avatar })} />{fe('avatar')}</div>
            {dialogErr && <div className="md:col-span-2"><ErrorNote>{dialogErr}</ErrorNote></div>}
            <div className="flex flex-wrap justify-end gap-3 md:col-span-2"><button type="button" className={btnLine} onClick={close}>Cancel</button><button disabled={busy} className={btn}>{busy ? 'Saving…' : 'Save changes'}</button></div>
          </form>
        </Modal>
      )}

      {dialog?.kind === 'perms' && (
        <Modal title={`Permissions – ${dialog.m.name}`} onClose={close} wide>
          <PermissionPicker value={perms} onChange={setPerms} />
          {dialogErr && <div className="mt-4"><ErrorNote>{dialogErr}</ErrorNote></div>}
          <div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" className={btnLine} onClick={close}>Cancel</button><button disabled={busy} onClick={savePerms} className={btn}>{busy ? 'Saving…' : 'Save permissions'}</button></div>
        </Modal>
      )}

      {dialog?.kind === 'password' && (
        <Modal title={`Reset password – ${dialog.m.name}`} onClose={close}>
          <form onSubmit={savePassword} noValidate className="space-y-4">
            <p className="text-sm text-steel">{dialog.m.name} is signed out on every device and must choose a new password at next sign-in.</p>
            {passwordField(password, setPassword)}
            {dialogErr && <ErrorNote>{dialogErr}</ErrorNote>}
            <div className="flex flex-wrap justify-end gap-3"><button type="button" className={btnLine} onClick={close}>Cancel</button><button disabled={busy} className={btn}>{busy ? 'Resetting…' : 'Reset password'}</button></div>
          </form>
        </Modal>
      )}

      {dialog?.kind === 'status' && (
        <ConfirmDialog title={dialog.m.active ? 'Deactivate team member' : 'Activate team member'} confirmLabel={dialog.m.active ? 'Deactivate' : 'Activate'} danger={dialog.m.active} busy={busy} onConfirm={setStatus} onCancel={close}>
          {dialog.m.active
            ? <><p>Deactivate <strong>{dialog.m.name}</strong>?</p><p>They are signed out immediately and cannot sign in until you activate the account again. Their work and history are kept.</p></>
            : <p>Activate <strong>{dialog.m.name}</strong>? They will be able to sign in again with their existing password and permissions.</p>}
          {dialogErr && <ErrorNote>{dialogErr}</ErrorNote>}
        </ConfirmDialog>
      )}

      {dialog?.kind === 'remove' && (
        <ConfirmDialog title="Remove team member" confirmLabel="Remove" danger busy={busy} onConfirm={remove} onCancel={close}>
          <p>Are you sure you want to remove this team member?</p>
          <p>This action will remove their admin access.</p>
          <p className="text-steel"><strong className="text-ink">{dialog.m.name}</strong> ({dialog.m.email}) is deleted permanently.{dialog.m.openEnquiries > 0 ? ` Their ${dialog.m.openEnquiries} open enquir${dialog.m.openEnquiries === 1 ? 'y returns' : 'ies return'} to the unassigned list.` : ''} To pause access instead, use Deactivate.</p>
          {dialogErr && <ErrorNote>{dialogErr}</ErrorNote>}
        </ConfirmDialog>
      )}
    </div>
  );
}
