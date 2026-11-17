'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { quickGreen } from './QuickEnquiryButton';

type Form = { name: string; phone: string; message: string };
type Result = { delivery: 'sent' | 'whatsapp_link' | 'saved'; whatsappUrl?: string };

const field = 'w-full border border-line bg-white px-3.5 py-2.5 text-[15px] placeholder:text-steel/70 focus:border-ink focus:outline-none';
const label = 'mb-1 block text-sm font-semibold';
/** Same rule as the server: 10 digits starting 6-9, optional +91 / 0 prefix, spaces and dashes allowed. */
const cleanPhone = (v: string) => v.replace(/[\s-]/g, '').replace(/^(\+?91|0)(?=\d{10}$)/, '');

/**
 * Quick Enquiry popup: full name, phone number and message. Posts to /api/inquiries/quick, where the enquiry is validated and saved and the WhatsApp
 * message to Panther is sent (if the WhatsApp Business API is set up) or prepared as a link. It only says "sent"
 * when the server confirms WhatsApp accepted the message.
 */
export function QuickEnquiryModal({ onClose }: { onClose: () => void }) {
  const { account, role } = useAuth();
  const mine = role === 'user' ? account : null;
  const [v, setV] = useState<Form>({ name: mine?.name ?? '', phone: mine?.phone ?? '', message: '' });
  const [errs, setErrs] = useState<Partial<Record<keyof Form, string>>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Result | null>(null);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    first.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setV((p) => ({ ...p, [k]: e.target.value })); setErrs((p) => ({ ...p, [k]: undefined })); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return; // no duplicate submissions
    const local: Partial<Record<keyof Form, string>> = {};
    if (v.name.trim().length < 2) local.name = 'Enter your name';
    if (!/^[6-9]\d{9}$/.test(cleanPhone(v.phone.trim()))) local.phone = 'Enter a valid 10-digit phone number';
    if (!v.message.trim()) local.message = 'Tell us what you are looking for';
    setErrs(local); setError('');
    if (Object.keys(local).length) return;
    setBusy(true);
    try {
      const r = await api<Result>('/inquiries/quick', { method: 'POST', body: JSON.stringify({ name: v.name.trim(), phone: v.phone.trim(), message: v.message.trim() }) });
      setDone(r);
      // Fallback mode: open WhatsApp with the message ready. A browser may block this; the success screen has a button too.
      if (r.delivery === 'whatsapp_link' && r.whatsappUrl) window.open(r.whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      // The form keeps everything that was typed.
      if (err instanceof ApiError && err.fieldErrors) { setErrs(err.fieldErrors as Partial<Record<keyof Form, string>>); setError(err.message); }
      else if (err instanceof ApiError && err.status === 429) setError(err.message);
      else setError('Unable to submit your enquiry right now. Please try again.');
    } finally { setBusy(false); }
  };

  const fe = (k: keyof Form) => errs[k] && <p role="alert" className="mt-1 text-sm text-panther-red">{errs[k]}</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div role="dialog" aria-modal="true" aria-labelledby="quick-enquiry-title"
        initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 10 }} transition={{ duration: 0.25, ease: [0.22, 0.7, 0.2, 1] }}
        className="relative flex max-h-[calc(100svh-2rem)] w-full max-w-[540px] flex-col border-t-4 border-green-700 bg-white text-ink shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-2 top-2 z-10 p-2.5 text-steel transition-colors hover:text-ink"><X className="h-5 w-5" /></button>

        {done ? (
          <div role="status" className="px-6 py-10 text-center sm:px-10">
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-700" aria-hidden />
            <h2 id="quick-enquiry-title" className="mt-4 font-display text-4xl leading-none">Enquiry submitted</h2>
            <p className="mt-3 text-steel">Thank you for contacting Panther EV. Our team will get in touch with you shortly.</p>
            {done.delivery === 'sent' && <p className="mt-3 text-sm font-semibold text-green-800">Your enquiry has been sent successfully.</p>}
            {done.delivery === 'whatsapp_link' && done.whatsappUrl && (
              <div className="mt-5 bg-fog p-4 text-sm">
                <p>Your enquiry has been saved. WhatsApp is opening so you can send the enquiry to Panther.</p>
                <a href={done.whatsappUrl} target="_blank" rel="noopener noreferrer" className={`mt-3 inline-flex items-center justify-center px-5 py-3 text-sm font-semibold uppercase tracking-wider ${quickGreen}`}>Open WhatsApp and send</a>
                <p className="mt-2 text-xs text-steel">If WhatsApp did not open, use this button. The message is ready; you only need to press Send.</p>
              </div>
            )}
            <button type="button" onClick={onClose} className="mt-6 border border-ink px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-ink hover:text-white">Close</button>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 pb-4 pt-6 sm:px-8">
              <h2 id="quick-enquiry-title" className="font-display text-4xl leading-none">Quick enquiry</h2>
              <p className="mt-1.5 text-sm text-steel">Tell us how we can help you.</p>
            </div>
            <form onSubmit={submit} noValidate className="overflow-y-auto px-6 py-5 sm:px-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="qe-name" className={label}>Full name <span className="text-panther-red">*</span></label><input id="qe-name" ref={first} value={v.name} onChange={set('name')} maxLength={80} autoComplete="name" placeholder="Enter your name" aria-invalid={!!errs.name} className={field} />{fe('name')}</div>
                <div><label htmlFor="qe-phone" className={label}>Phone number <span className="text-panther-red">*</span></label><input id="qe-phone" type="tel" inputMode="tel" value={v.phone} onChange={set('phone')} maxLength={20} autoComplete="tel" placeholder="Enter your phone number" aria-invalid={!!errs.phone} className={field} />{fe('phone')}</div>
                <div className="sm:col-span-2"><label htmlFor="qe-message" className={label}>Message <span className="text-panther-red">*</span></label><textarea id="qe-message" rows={4} aria-invalid={!!errs.message} value={v.message} onChange={set('message')} maxLength={1500} placeholder="Tell us what you are looking for..." className={field} />{fe('message')}</div>
              </div>
              {error && <p role="alert" className="mt-4 bg-red-50 px-4 py-3 text-sm text-panther-red">{error}</p>}
              <button disabled={busy} aria-busy={busy} className={`mt-5 w-full py-3.5 text-sm font-semibold uppercase tracking-wider ${quickGreen}`}>{busy ? 'Submitting…' : 'Submit enquiry'}</button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
