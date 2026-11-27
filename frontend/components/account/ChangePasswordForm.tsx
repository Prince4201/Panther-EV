'use client';
import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApiError, api } from '@/lib/api';
import { Field, btnPrimary, inputCls } from './fields';

export const passwordRules = 'At least 8 characters, with a letter and a number.';
export const checkPassword = (p: string) =>
  p.length < 8
    ? 'Use at least 8 characters'
    : !/[A-Za-z]/.test(p)
      ? 'Include at least one letter'
      : !/[0-9]/.test(p)
        ? 'Include at least one number'
        : '';

export function ChangePasswordForm() {
  const [v, setV] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [errs, setErrs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setV((p) => ({ ...p, [k]: e.target.value }));
    if (errs[k]) {
      setErrs((p) => {
        const next = { ...p };
        delete next[k];
        return next;
      });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const local: Record<string, string> = {};

    if (!v.currentPassword) local.currentPassword = 'Enter your current password';
    const weak = checkPassword(v.newPassword);
    if (weak) local.newPassword = weak;
    if (v.newPassword && v.currentPassword && v.newPassword === v.currentPassword) {
      local.newPassword = 'New password cannot be the same as your current password';
    }
    if (v.newPassword !== v.confirmPassword) {
      local.confirmPassword = 'Passwords do not match';
    }

    setErrs(local);
    if (Object.keys(local).length) return;

    setBusy(true);
    try {
      const r = await api<{ message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(v),
      });
      setV({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMsg({ ok: true, text: r.message || 'Password updated successfully. Other devices have been signed out.' });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrs(err.fieldErrors ?? {});
        setMsg({ ok: false, text: err.message });
      } else {
        setMsg({ ok: false, text: 'Could not change password. Please try again.' });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="max-w-md space-y-5">
      {/* Current password */}
      <Field id="cp-cur" label="Current password" error={errs.currentPassword}>
        <div className="relative">
          <input
            id="cp-cur"
            type={showCur ? 'text' : 'password'}
            autoComplete="current-password"
            value={v.currentPassword}
            onChange={set('currentPassword')}
            placeholder="Enter your current password"
            className={`${inputCls} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowCur(!showCur)}
            aria-label={showCur ? 'Hide current password' : 'Show current password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-steel hover:text-ink transition-colors p-1"
          >
            {showCur ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      {/* New password */}
      <Field id="cp-new" label="New password" error={errs.newPassword} hint={passwordRules}>
        <div className="relative">
          <input
            id="cp-new"
            type={showNew ? 'text' : 'password'}
            autoComplete="new-password"
            value={v.newPassword}
            onChange={set('newPassword')}
            placeholder="Enter new strong password"
            className={`${inputCls} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            aria-label={showNew ? 'Hide new password' : 'Show new password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-steel hover:text-ink transition-colors p-1"
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      {/* Confirm new password */}
      <Field id="cp-conf" label="Confirm new password" error={errs.confirmPassword}>
        <div className="relative">
          <input
            id="cp-conf"
            type={showConf ? 'text' : 'password'}
            autoComplete="new-password"
            value={v.confirmPassword}
            onChange={set('confirmPassword')}
            placeholder="Re-enter new password"
            className={`${inputCls} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowConf(!showConf)}
            aria-label={showConf ? 'Hide password confirmation' : 'Show password confirmation'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-steel hover:text-ink transition-colors p-1"
          >
            {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      {/* Feedback Message */}
      {msg && (
        <div
          role={msg.ok ? 'status' : 'alert'}
          className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm transition-all ${
            msg.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-panther-red'
          }`}
        >
          {msg.ok ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-panther-red mt-0.5" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={busy}
        className={`${btnPrimary} w-full sm:w-auto min-w-[200px]`}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating password…</span>
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" />
            <span>Change password</span>
          </>
        )}
      </button>
    </form>
  );
}
