'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { ApiError, api } from '@/lib/api';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setMsg({ ok: false, text: 'Please enter a valid email address.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const r = await api<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMsg({ ok: true, text: r.message });
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof ApiError ? err.message : 'Could not send the reset link. Please try again.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="relative flex min-h-[calc(100svh-72px)] items-center justify-center bg-[#F8F9FA] px-5 py-12 lg:min-h-[calc(100svh-80px)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(228,32,43,0.04),transparent_60%)]"
      />

      <div className="relative w-full max-w-[440px] rounded-2xl border border-slate-200/90 bg-white p-7 shadow-[0_20px_50px_-15px_rgba(16,24,40,0.10)] sm:p-10">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-steel transition-colors hover:text-panther-red"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>

        <h1 className="font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">Forgot password</h1>
        <p className="mt-2 text-sm text-steel">
          Enter your registered email address and we will send you a secure link to reset your password.
        </p>

        <form onSubmit={submit} noValidate className="mt-8 space-y-4">
          <div>
            <label htmlFor="fp-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-charcoal">
              Email address
            </label>
            <div className="relative">
              <input
                id="fp-email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-ink placeholder:text-steel/50 transition-all focus:border-panther-red focus:outline-none focus:ring-4 focus:ring-panther-red/10"
              />
            </div>
          </div>

          {msg && (
            <div
              role={msg.ok ? 'status' : 'alert'}
              className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${
                msg.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-panther-red'
              }`}
            >
              {msg.ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-panther-red" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="group relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-panther-red via-[#E8222E] to-[#B8101C] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_6px_20px_-2px_rgba(228,32,43,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-2px_rgba(228,32,43,0.65)] active:translate-y-0 active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Sending link…</span>
              </span>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-steel">
          Remember your password?{' '}
          <Link href="/login" className="font-bold text-panther-red hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
