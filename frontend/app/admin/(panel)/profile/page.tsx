'use client';
import { useRef, useState } from 'react';
import { ImagePlus, KeyRound, Loader2, Pencil } from 'lucide-react';
import { ApiError, api } from '@/lib/api';
import { prepareImage } from '@/lib/imagePrep';
import { useAdmin } from '@/components/admin/AdminContext';
import { ActiveBadge, Avatar, Card, ErrorNote, OkNote, PageTitle, RoleBadge, btn, btnLine, input } from '@/components/admin/ui';
import { PERMISSION_LABELS } from '@/components/admin/PermissionPicker';
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';
import { fmtDate } from '@/lib/enquiry';

type Form = { name: string; phone: string; avatar: string; line1: string; city: string; state: string; pincode: string; country: string };
const label = 'block text-sm font-semibold';
const field = `${input} mt-1.5 font-normal`;

const Row = ({ term, children }: { term: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-6">
    <dt className="w-36 shrink-0 text-sm text-steel">{term}</dt>
    <dd className="min-w-0 break-words text-sm font-semibold">{children}</dd>
  </div>
);

/**
 * The signed-in staff member's own profile. Everything comes from the admin session (AdminContext), and every save goes
 * to /auth/profile, which only ever edits the account that owns the session. Role, permissions and status are shown
 * but cannot be changed here (the API has no fields for them).
 */
export default function AdminProfile() {
  const { admin, isSuper, refresh } = useAdmin();
  const [form, setForm] = useState<Form | null>(null); // null = viewing, otherwise editing
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(!!admin.mustChangePassword);
  const file = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setMsg(null); setErrs({});
    setForm({ name: admin.name, phone: admin.phone ?? '', avatar: admin.avatar ?? '', line1: admin.address?.line1 ?? '', city: admin.address?.city ?? '', state: admin.address?.state ?? '', pincode: admin.address?.pincode ?? '', country: admin.address?.country || 'India' });
  };
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => (f ? { ...f, [k]: e.target.value } : f));

  const uploadPhoto = async (f: File) => {
    setPhotoBusy(true); setMsg(null);
    try {
      const ready = await prepareImage(f, 800); // a profile photo never needs to be larger
      const fd = new FormData(); fd.append('image', ready, ready.name);
      const r = await api<{ url: string }>('/auth/upload-avatar', { method: 'POST', body: fd });
      setForm((p) => (p ? { ...p, avatar: r.url } : p));
    } catch (e) { setMsg({ ok: false, text: e instanceof ApiError ? e.message : 'Upload failed.' }); }
    finally { setPhotoBusy(false); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const local: Record<string, string> = {};
    if (form.name.trim().length < 2) local.name = 'Enter your name';
    if (form.phone.trim() && !/^[0-9+\-\s]{7,20}$/.test(form.phone.trim())) local.phone = 'Enter a valid phone number';
    setErrs(local); setMsg(null);
    if (Object.keys(local).length) return;
    setBusy(true);
    try {
      await api('/auth/profile', { method: 'PUT', body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim(), avatar: form.avatar, address: { line1: form.line1, city: form.city, state: form.state, pincode: form.pincode, country: form.country } }) });
      await refresh(); // the sidebar and this page now show the saved details
      setForm(null);
      setMsg({ ok: true, text: 'Profile updated.' });
    } catch (err) {
      if (err instanceof ApiError) { setErrs(Object.fromEntries(Object.entries(err.fieldErrors ?? {}).map(([k, m]) => [k.replace('address.', ''), m]))); setMsg({ ok: false, text: err.status === 0 ? 'Unable to save your profile. Please check your connection and try again.' : err.message }); }
      else setMsg({ ok: false, text: 'Unable to save your profile. Please try again.' });
    } finally { setBusy(false); }
  };

  const fe = (k: string) => errs[k] && <span role="alert" className="mt-1 block text-sm font-normal text-panther-red">{errs[k]}</span>;
  const address = [admin.address?.line1, admin.address?.city, admin.address?.state, admin.address?.pincode, admin.address?.country].filter(Boolean).join(', ');
  const hasAddress = !!(admin.address?.line1 || admin.address?.city || admin.address?.state || admin.address?.pincode);
  const shownAvatar = form ? form.avatar : admin.avatar;

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle title="Profile" sub="Manage your account information and security." />
      {msg && <div className="mb-6">{msg.ok ? <OkNote>{msg.text}</OkNote> : <ErrorNote>{msg.text}</ErrorNote>}</div>}

      {/* Identity card */}
      <section className="flex flex-col items-start gap-5 bg-white p-6 sm:flex-row sm:items-center md:p-8">
        <Avatar name={admin.name} src={shownAvatar} className="h-24 w-24 text-3xl" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-4xl leading-none">{admin.name}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${isSuper ? 'bg-panther-red text-white' : 'bg-amber-50 text-amber-900'}`}>{isSuper ? 'Super Admin' : 'Admin'}</span>
            <ActiveBadge active={admin.active !== false} />
          </div>
          <p className="mt-2 break-all text-sm text-steel">{admin.email}</p>
        </div>
        {!form && <button type="button" className={btn} onClick={startEdit}><Pencil className="h-4 w-4" aria-hidden />Edit profile</button>}
      </section>

      {form ? (
        <Card title="Edit profile" className="mt-6">
          <form onSubmit={save} noValidate className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <p className="mb-1.5 text-sm font-semibold">Profile photo</p>
              <div className="flex flex-wrap items-center gap-3">
                <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ''; }} />
                <button type="button" onClick={() => file.current?.click()} disabled={photoBusy} className={btnLine}>
                  {photoBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}{photoBusy ? 'Uploading…' : form.avatar ? 'Change photo' : 'Upload photo'}
                </button>
                {form.avatar && <button type="button" onClick={() => setForm((p) => (p ? { ...p, avatar: '' } : p))} className="text-sm text-steel underline hover:text-ink">Remove photo</button>}
                <span className="text-xs text-steel">JPG, PNG, WebP or AVIF, up to 8 MB. Applied when you save.</span>
              </div>
              {fe('avatar')}
            </div>
            <label className={label}>Full name<input value={form.name} onChange={set('name')} maxLength={80} autoComplete="name" className={field} />{fe('name')}</label>
            <label className={label}>Phone number<input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" className={field} />{fe('phone')}</label>
            <label className={`${label} md:col-span-2`}>Email<input value={admin.email} disabled className={field} /><span className="mt-1 block text-xs font-normal text-steel">Your email is your sign-in name and cannot be changed here.</span></label>
            <label className={`${label} md:col-span-2`}>Address<input value={form.line1} onChange={set('line1')} autoComplete="address-line1" className={field} />{fe('line1')}</label>
            <label className={label}>City<input value={form.city} onChange={set('city')} autoComplete="address-level2" className={field} />{fe('city')}</label>
            <label className={label}>State<input value={form.state} onChange={set('state')} autoComplete="address-level1" className={field} />{fe('state')}</label>
            <label className={label}>Pincode<input value={form.pincode} onChange={set('pincode')} inputMode="numeric" autoComplete="postal-code" className={field} />{fe('pincode')}</label>
            <label className={label}>Country<input value={form.country} onChange={set('country')} autoComplete="country-name" className={field} />{fe('country')}</label>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button disabled={busy || photoBusy} className={btn}>{busy ? 'Saving…' : 'Save changes'}</button>
              <button type="button" className={btnLine} disabled={busy} onClick={() => { setForm(null); setErrs({}); setMsg(null); }}>Cancel</button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card title="Personal information">
            <dl>
              <Row term="Full name">{admin.name}</Row>
              <Row term="Email">{admin.email}</Row>
              <Row term="Phone">{admin.phone || <span className="font-normal text-steel">Not added</span>}</Row>
              <Row term="Address">{hasAddress ? address : <span className="font-normal text-steel">Not added</span>}</Row>
            </dl>
          </Card>
          <Card title="Account information">
            <dl>
              <Row term="Role"><RoleBadge role={admin.role} /></Row>
              <Row term="Status"><ActiveBadge active={admin.active !== false} /></Row>
              <Row term="Joined">{fmtDate(admin.createdAt)}</Row>
              <Row term="Last login">{fmtDate(admin.lastLoginAt, true)}</Row>
            </dl>
            <p className="mt-3 text-xs text-steel">Role, permissions and status are controlled by the system and cannot be edited here.</p>
          </Card>
        </div>
      )}

      <Card title="Permissions" className="mt-6">
        {isSuper ? <p className="text-sm">Full access to every part of the admin panel, including team and permission management.</p>
          : admin.permissions.length === 0 ? <p className="text-sm text-steel">Enquiries assigned to you. The Super Admin can grant more.</p>
          : <ul className="flex flex-wrap gap-2">{admin.permissions.map((p) => <li key={p} className="bg-fog px-2.5 py-1 text-xs font-semibold">{PERMISSION_LABELS[p] ?? p}</li>)}</ul>}
      </Card>

      <Card title="Security" className="mt-6">
        <p className="mb-4 text-sm text-steel">Use a password of at least 10 characters with a letter and a number. Changing it signs you out on your other devices.</p>
        {showPassword ? <ChangePasswordForm /> : <button type="button" className={btnLine} onClick={() => setShowPassword(true)}><KeyRound className="h-4 w-4" aria-hidden />Change password</button>}
      </Card>
    </div>
  );
}
