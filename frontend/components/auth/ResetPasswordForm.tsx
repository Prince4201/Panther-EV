'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import { Field, Notice, btnPrimary, inputCls } from '@/components/account/fields';
import { checkPassword, passwordRules } from '@/components/account/ChangePasswordForm';

export function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';
  const [v, setV] = useState({ newPassword: '', confirmPassword: '' });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const local: Record<string, string> = {};
    const weak = checkPassword(v.newPassword); if (weak) local.newPassword = weak;
    if (v.newPassword !== v.confirmPassword) local.confirmPassword = 'Passwords do not match';
    setErrs(local); setMsg(null);
    if (Object.keys(local).length) return;
    setBusy(true);
    try { const r = await api<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, ...v }) }); setMsg({ ok: true, text: r.message }); setDone(true); }
    catch (err) { setMsg({ ok: false, text: err instanceof ApiError ? err.message : 'Could not reset the password.' }); }
    finally { setBusy(false); }
  };

  return (
    <section className="grid min-h-[calc(100svh-72px)] place-items-center bg-fog px-5 py-12 lg:min-h-[calc(100svh-80px)]">
      <div className="w-full max-w-md bg-white p-6 shadow-sm sm:p-10">
        <h1 className="font-display text-4xl md:text-5xl">Choose a new password</h1>
        {!token ? (
          <div className="mt-6 space-y-4"><Notice ok={false}>This reset link is not valid.</Notice><Link href="/forgot-password" className="font-semibold text-panther-red underline">Request a new link</Link></div>
        ) : done ? (
          <div className="mt-6 space-y-4"><Notice ok>{msg?.text}</Notice><Link href="/login" className={`inline-block ${btnPrimary}`}>Sign in</Link></div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-8 space-y-5">
            <Field id="rp-new" label="New password" error={errs.newPassword} hint={passwordRules}><input id="rp-new" type="password" autoComplete="new-password" value={v.newPassword} onChange={(e) => setV((p) => ({ ...p, newPassword: e.target.value }))} className={inputCls} /></Field>
            <Field id="rp-conf" label="Confirm new password" error={errs.confirmPassword}><input id="rp-conf" type="password" autoComplete="new-password" value={v.confirmPassword} onChange={(e) => setV((p) => ({ ...p, confirmPassword: e.target.value }))} className={inputCls} /></Field>
            {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}
            <button disabled={busy} className={`w-full ${btnPrimary}`}>{busy ? 'Saving…' : 'Update password'}</button>
            {msg && !msg.ok && <p className="text-sm"><Link href="/forgot-password" className="font-semibold text-panther-red underline">Request a new link</Link></p>}
          </form>
        )}
      </div>
    </section>
  );
}
