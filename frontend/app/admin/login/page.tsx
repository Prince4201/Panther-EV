'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { ApiError, api } from '@/lib/api';

const schema = z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(1, 'Enter your password') });
type Values = z.infer<typeof schema>;

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    setError('');
    try { await api('/admin/login', { method: 'POST', body: JSON.stringify(v) }); router.replace('/admin/dashboard'); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Could not sign in.'); }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-fog px-5">
      <div className="w-full max-w-md bg-white p-8 shadow-sm md:p-10">
        <Image src="/brand/panther-logo.png" alt="Panther" width={391} height={186} priority className="h-12 w-auto" />
        <h1 className="mt-6 font-display text-4xl">Admin sign in</h1>
        <p className="mt-1 text-sm text-steel">Manage the Panther EV website.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
            <input id="email" type="email" autoComplete="username" aria-invalid={!!errors.email} {...register('email')} className="w-full border border-line px-4 py-3 focus:border-ink focus:outline-none" />
            {errors.email && <p role="alert" className="mt-1 text-sm text-panther-red">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
            <input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register('password')} className="w-full border border-line px-4 py-3 focus:border-ink focus:outline-none" />
            {errors.password && <p role="alert" className="mt-1 text-sm text-panther-red">{errors.password.message}</p>}
          </div>
          {error && <p role="alert" className="bg-red-50 px-4 py-3 text-sm text-panther-red">{error}</p>}
          <p className="text-sm"><a href="/forgot-password" className="font-semibold text-panther-red underline">Forgot password?</a></p>
          <button disabled={isSubmitting} className="w-full bg-panther-red py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-ink disabled:opacity-60">{isSubmitting ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    </main>
  );
}
