'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ApiError, api } from '@/lib/api';
import { Field, Notice, btnPrimary, inputCls } from '@/components/account/fields';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setMsg({ ok: false, text: 'Enter a valid email.' }); return; }
    setBusy(true); setMsg(null);
    try { const r = await api<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }); setMsg({ ok: true, text: r.message }); }
    catch (err) { setMsg({ ok: false, text: err instanceof ApiError ? err.message : 'Could not send the link.' }); }
    finally { setBusy(false); }
  };
  return (
    <section className="grid min-h-[calc(100svh-72px)] place-items-center bg-fog px-5 py-12 lg:min-h-[calc(100svh-80px)]">
      <div className="w-full max-w-md bg-white p-6 shadow-sm sm:p-10">
        <h1 className="font-display text-4xl md:text-5xl">Forgot password</h1>
        <p className="mt-1 text-sm text-steel">Enter your email and we will send you a link to choose a new password.</p>
        <form onSubmit={submit} noValidate className="mt-8 space-y-5">
          <Field id="fp-email" label="Email"><input id="fp-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Field>
          {msg && <Notice ok={msg.ok}>{msg.text}</Notice>}
          <button disabled={busy} className={`w-full ${btnPrimary}`}>{busy ? 'Sending…' : 'Send reset link'}</button>
        </form>
        <p className="mt-6 text-sm text-steel"><Link href="/login" className="font-semibold text-panther-red underline">Back to sign in</Link></p>
      </div>
    </section>
  );
}
