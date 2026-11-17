'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, 'Enter a valid phone number'),
  email: z.string().trim().email('Enter a valid email').or(z.literal('')),
  city: z.string().trim().max(80),
  subject: z.string().trim().max(120),
  message: z.string().trim().max(1500),
});
type Values = z.infer<typeof schema>;

const field = 'w-full border border-line bg-white px-4 py-3 focus:border-ink focus:outline-none';

/** Used by the Contact page and by the enquiry cart. `vehicles` is attached to the enquiry when sent from the cart. */
export function EnquiryForm({ vehicles = [], source = 'contact', withSubject = true, onSent, compact, defaultSubject = '', idPrefix, submitLabel = 'Send enquiry', messageHint }: {
  vehicles?: Array<{ slug: string; name: string }>; source?: 'cart' | 'contact'; withSubject?: boolean; onSent?: () => void; compact?: boolean;
  defaultSubject?: string; idPrefix?: string; submitLabel?: string; messageHint?: string;
}) {
  const pre = idPrefix ?? source;
  const { account, role } = useAuth();
  const [done, setDone] = useState('');
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: role === 'user' ? account?.name ?? '' : '', email: role === 'user' ? account?.email ?? '' : '', phone: '', city: '', subject: defaultSubject, message: '' },
    values: role === 'user' && account ? { name: account.name, email: account.email, phone: account.phone ?? '', city: '', subject: defaultSubject, message: '' } : undefined,
  });

  const onSubmit = async (v: Values) => {
    setError('');
    try {
      const country = (typeof window !== 'undefined' && localStorage.getItem('panther-country')) || 'IN';
      const r = await api<{ message: string }>('/inquiries', { method: 'POST', body: JSON.stringify({ ...v, vehicles, source, country }) });
      setDone(r.message); reset({ name: '', phone: '', email: '', city: '', subject: defaultSubject, message: '' }); onSent?.();
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Could not send. Please try again.'); }
  };

  if (done) {
    return (
      <div role="status" className="flex items-start gap-3 bg-fog p-5">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" aria-hidden />
        <div><p className="font-semibold">Enquiry sent</p><p className="mt-1 text-sm text-steel">{done}</p>
          <button onClick={() => setDone('')} className="mt-3 text-sm font-semibold text-panther-red underline">Send another</button></div>
      </div>
    );
  }

  const err = (m?: string) => m && <p role="alert" className="mt-1 text-sm text-panther-red">{m}</p>;
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className={cn('grid gap-4', !compact && 'sm:grid-cols-2')}>
        <div><label htmlFor={`${pre}-name`} className="mb-1.5 block text-sm font-semibold">Name</label><input id={`${pre}-name`} autoComplete="name" {...register('name')} className={field} />{err(errors.name?.message)}</div>
        <div><label htmlFor={`${pre}-phone`} className="mb-1.5 block text-sm font-semibold">Phone</label><input id={`${pre}-phone`} type="tel" autoComplete="tel" inputMode="tel" {...register('phone')} className={field} />{err(errors.phone?.message)}</div>
        <div><label htmlFor={`${pre}-email`} className="mb-1.5 block text-sm font-semibold">Email <span className="font-normal text-steel">(optional)</span></label><input id={`${pre}-email`} type="email" autoComplete="email" {...register('email')} className={field} />{err(errors.email?.message)}</div>
        <div><label htmlFor={`${pre}-city`} className="mb-1.5 block text-sm font-semibold">City</label><input id={`${pre}-city`} autoComplete="address-level2" {...register('city')} className={field} /></div>
      </div>
      {withSubject && <div><label htmlFor={`${pre}-subject`} className="mb-1.5 block text-sm font-semibold">Subject</label><input id={`${pre}-subject`} {...register('subject')} className={field} /></div>}
      <div><label htmlFor={`${pre}-message`} className="mb-1.5 block text-sm font-semibold">Message <span className="font-normal text-steel">(optional)</span></label><textarea id={`${pre}-message`} rows={compact ? 3 : 5} placeholder={messageHint} {...register('message')} className={field} /></div>
      {error && <p role="alert" className="bg-red-50 px-4 py-3 text-sm text-panther-red">{error}</p>}
      <button disabled={isSubmitting} className="w-full bg-panther-red py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-ink disabled:opacity-60">{isSubmitting ? 'Sending…' : submitLabel}</button>
    </form>
  );
}
