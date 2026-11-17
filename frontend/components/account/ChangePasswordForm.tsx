'use client';
import { useState } from 'react';
import { ApiError, api } from '@/lib/api';
import { Field, Notice, btnPrimary, inputCls } from './fields';

export const passwordRules = 'At least 10 characters, with a letter and a number.';
export const checkPassword = (p: string) => (p.length < 10 ? 'Use at least 10 characters' : !/[A-Za-z]/.test(p) ? 'Include at least one letter' : !/[0-9]/.test(p) ? 'Include at least one number' : '');

export function ChangePasswordForm() {
  const [v, setV] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const local: Record<string, string> = {};
    if (!v.currentPassword) local.currentPassword = 'Enter your current password';
    const weak = checkPassword(v.newPassword); if (weak) local.newPassword = weak;
    if (v.newPassword !== v.confirmPassword) local.confirmPassword = 'Passwords do not match';
    setErrs(local);
    if (Object.keys(local).length) return;
    setBusy(true);
    try {
      const r = await api<{ message: string }>('/auth/change-password', { method: 'POST', body: JSON.stringify(v) });
      setV({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMsg({ ok: true, text: r.message });
    } catch (err) {
      if (err instanceof ApiError) { setErrs(err.fieldErrors ?? {}); setMsg({ ok: false, text: err.message }); } else setMsg({ ok: false, text: 'Could not change password.' });
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate className="max-w-md space-y-5">
      <Field id="cp-cur" label="Current password" error={errs.currentPassword}><input id="cp-cur" type="password" autoComplete="current-password" value={v.currentPassword} onChange={set('currentPassword')} className={inputCls} /></Field>
      <Field id="cp-new" label="New password" error={errs.newPassword} hint={passwordRules}><input id="cp-new" type="password" autoComplete="new-password" value={v.newPassword} onChange={set('newPassword')} className={inputCls} /></Field>
      <Field id="cp-conf" label="Confirm new password" error={errs.confirmPassword}><input id="cp-conf" type="password" autoComplete="new-password" value={v.confirmPassword} onChange={set('confirmPassword')} className={inputCls} /></Field>
      {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}
      <button disabled={busy} className={btnPrimary}>{busy ? 'Updating…' : 'Change password'}</button>
    </form>
  );
}
