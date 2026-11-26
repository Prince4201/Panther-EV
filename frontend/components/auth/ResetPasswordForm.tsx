'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { ApiError, api } from '@/lib/api';
import { checkPassword, passwordRules } from '@/components/account/ChangePasswordForm';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-ink placeholder:text-steel/50 transition-all focus:border-panther-red focus:outline-none focus:ring-4 focus:ring-panther-red/10';

export function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';
  const [v, setV] = useState({ newPassword: '', confirmPassword: '' });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const local: Record<string, string> = {};
    const weak = checkPassword(v.newPassword);
    if (weak) local.newPassword = weak;
    if (v.newPassword !== v.confirmPassword) local.confirmPassword = 'Passwords do not match';
    setErrs(local);
    setMsg(null);
    if (Object.keys(local).length) return;
    setBusy(true);
    try {
      const r = await api<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, ...v }),
      });
      setMsg({ ok: true, text: r.message });
      setDone(true);
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof ApiError ? err.message : 'Could not reset the password.',
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
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">New Password</h1>
        <p className="mt-2 text-sm text-steel">Set a strong, secure password for your Panther account.</p>

        {!token ? (
          <div className="mt-6 space-y-4">
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-panther-red">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>This password reset link is invalid or has expired.</span>
            </div>
            <Link
              href="/forgot-password"
              className="inline-block text-sm font-bold text-panther-red hover:underline"
            >
              Request a new reset link →
            </Link>
          </div>
        ) : done ? (
          <div className="mt-6 space-y-5">
            <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{msg?.text || 'Your password has been successfully updated.'}</span>
            </div>
            <Link
              href="/login"
              className="block w-full rounded-xl bg-gradient-to-r from-panther-red via-[#E8222E] to-[#B8101C] py-3.5 text-center text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all hover:shadow-lg"
            >
              Sign in with new password
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            <div>
              <label htmlFor="rp-new" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-charcoal">
                New password
              </label>
              <div className="relative">
                <input
                  id="rp-new"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={v.newPassword}
                  onChange={(e) => setV((p) => ({ ...p, newPassword: e.target.value }))}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-steel hover:text-ink"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errs.newPassword ? (
                <p role="alert" className="mt-1.5 text-xs text-panther-red">{errs.newPassword}</p>
              ) : (
                <p className="mt-1 text-xs text-steel/70">{passwordRules}</p>
              )}
            </div>

            <div>
              <label htmlFor="rp-conf" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-charcoal">
                Confirm new password
              </label>
              <input
                id="rp-conf"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={v.confirmPassword}
                onChange={(e) => setV((p) => ({ ...p, confirmPassword: e.target.value }))}
                className={inputClass}
              />
              {errs.confirmPassword && (
                <p role="alert" className="mt-1.5 text-xs text-panther-red">{errs.confirmPassword}</p>
              )}
            </div>

            {msg && !msg.ok && (
              <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-panther-red">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{msg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="group relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-panther-red via-[#E8222E] to-[#B8101C] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_6px_20px_-2px_rgba(228,32,43,0.45)] transition-all hover:shadow-[0_10px_28px_-2px_rgba(228,32,43,0.65)] active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-steel">
          <Link href="/login" className="font-bold text-panther-red hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
