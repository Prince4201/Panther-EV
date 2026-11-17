'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ApiError, api } from '@/lib/api';
import { useAuth, type Account } from './AuthProvider';

const loginSchema = z.object({ email: z.string().trim().email('Enter a valid email'), password: z.string().min(1, 'Enter your password') });
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, 'Enter a valid phone number').or(z.literal('')),
  password: z.string().min(8, 'Use at least 8 characters'),
});
type Values = { name?: string; email: string; phone?: string; password: string };

const input = 'w-full border border-line px-4 py-3 focus:border-ink focus:outline-none';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState('');
  const isLogin = mode === 'login';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(isLogin ? loginSchema : registerSchema) as unknown as Resolver<Values> });

  const onSubmit = async (v: Values) => {
    setError('');
    try {
      const r = await api<{ role: 'super_admin' | 'admin' | 'user'; account: Account }>(isLogin ? '/auth/login' : '/auth/register', { method: 'POST', body: JSON.stringify(v) });
      await refresh();
      const next = params.get('next');
      router.replace(r.role !== 'user' ? '/admin/dashboard' : next && next.startsWith('/') && !next.startsWith('//') ? next : '/account');
      router.refresh();
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not sign in. Please try again.'); }
  };

  const err = (m?: string) => m && <p role="alert" className="mt-1 text-sm text-panther-red">{m}</p>;
  return (
    <section className="grid min-h-[calc(100svh-72px)] place-items-center bg-fog px-5 py-12 lg:min-h-[calc(100svh-80px)]">
      <div className="w-full max-w-md bg-white p-6 shadow-sm sm:p-10">
        <h1 className="font-display text-4xl md:text-5xl">{isLogin ? 'Sign in' : 'Create account'}</h1>
        <p className="mt-1 text-sm text-steel">{isLogin ? 'Welcome back. Sign in to see your enquiries.' : 'Save vehicles and track your enquiries.'}</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
          {!isLogin && <div><label htmlFor="name" className="mb-1.5 block text-sm font-semibold">Full name</label><input id="name" autoComplete="name" {...register('name')} className={input} />{err(errors.name?.message)}</div>}
          <div><label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label><input id="email" type="email" autoComplete="username" {...register('email')} className={input} />{err(errors.email?.message)}</div>
          {!isLogin && <div><label htmlFor="phone" className="mb-1.5 block text-sm font-semibold">Phone <span className="font-normal text-steel">(optional)</span></label><input id="phone" type="tel" autoComplete="tel" {...register('phone')} className={input} />{err(errors.phone?.message)}</div>}
          <div><label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label><input id="password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} {...register('password')} className={input} />{err(errors.password?.message)}{isLogin && <p className="mt-2 text-sm"><Link href="/forgot-password" className="font-semibold text-panther-red underline">Forgot password?</Link></p>}</div>
          {error && <p role="alert" className="bg-red-50 px-4 py-3 text-sm text-panther-red">{error}</p>}
          <button disabled={isSubmitting} className="w-full bg-panther-red py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-ink disabled:opacity-60">{isSubmitting ? (isLogin ? 'Signing in…' : 'Creating…') : isLogin ? 'Sign in' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-sm text-steel">
          {isLogin ? <>New to Panther? <Link href="/register" className="font-semibold text-panther-red underline">Create an account</Link></> : <>Already have an account? <Link href="/login" className="font-semibold text-panther-red underline">Sign in</Link></>}
        </p>
      </div>
    </section>
  );
}
