'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { ApiError, api } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});
type Values = z.infer<typeof schema>;

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    setError('');
    try {
      await api('/admin/login', { method: 'POST', body: JSON.stringify(v) });
      router.replace('/admin/dashboard');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not sign in.');
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07080c] px-4 py-12 flex items-center justify-center text-white">
      {/* Ambient background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-panther-red/20 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-48 h-[550px] w-[550px] rounded-full bg-amber-500/10 blur-[150px]"
      />

      {/* Subtle grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
      />

      <div className="relative w-full max-w-md">
        <div className="relative rounded-3xl border border-white/15 bg-white/[0.06] p-7 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/10">
          {/* Top red accent */}
          <div
            aria-hidden
            className="absolute inset-x-12 top-0 h-[2px] bg-gradient-to-r from-transparent via-panther-red to-transparent"
          />

          <div className="flex items-center justify-between">
            <Link href="/" aria-label="Panther EV home">
              <Image
                src="/brand/panther-logo.png"
                alt="Panther EV"
                width={391}
                height={186}
                priority
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <span className="flex items-center gap-1.5 rounded-full border border-panther-red/40 bg-panther-red/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-panther-red">
              <Shield className="h-3 w-3" />
              Staff Portal
            </span>
          </div>

          <h1 className="mt-8 font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
            Admin Sign In
          </h1>
          <p className="mt-1.5 text-sm text-white/60">
            Sign in to manage Panther EV products, bookings, and customer enquiries.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/80">
                Staff Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@pantherev.com"
                  {...register('email')}
                  className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-panther-red focus:bg-black/60 focus:outline-none focus:ring-4 focus:ring-panther-red/20"
                />
              </div>
              {errors.email?.message && (
                <p role="alert" className="mt-1.5 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-white/80">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-white/60 transition-colors hover:text-panther-red hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-11 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-panther-red focus:bg-black/60 focus:outline-none focus:ring-4 focus:ring-panther-red/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password?.message && (
                <p role="alert" className="mt-1.5 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-panther-red via-[#E8222E] to-[#B8101C] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_8px_25px_-4px_rgba(228,32,43,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-4px_rgba(228,32,43,0.7)] active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing in…</span>
                </span>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <Link href="/" className="text-xs font-semibold text-white/50 hover:text-white transition-colors">
              ← Return to Panther EV Website
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
