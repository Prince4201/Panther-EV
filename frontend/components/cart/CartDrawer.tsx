'use client';
import { isExternalImage } from '@/lib/media';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { useCart } from './CartProvider';
import { EnquiryForm } from '@/components/forms/EnquiryForm';

export function CartDrawer() {
  const { items, open, setOpen, remove, clear } = useCart();
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', esc); };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/50" aria-hidden />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.28 }}
            role="dialog" aria-modal="true" aria-label="Enquiry cart" className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-3xl"><ShoppingCart className="h-6 w-6" aria-hidden />Enquiry cart</h2>
              <button ref={closeBtn} onClick={() => setOpen(false)} aria-label="Close cart" className="-mr-2 p-2"><X className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {items.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="font-display text-3xl">Your cart is empty</p>
                  <p className="mt-2 text-sm text-steel">Add the vehicles you are interested in with “Add to enquiry”. We will contact you with details and prices.</p>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-line border-y border-line">
                    {items.map((i) => (
                      <li key={i.slug} className="flex items-center gap-4 py-3">
                        <div className="relative h-16 w-24 shrink-0 bg-fog"><Image src={i.image} unoptimized={isExternalImage(i.image)} alt="" fill sizes="96px" className="object-contain p-1" /></div>
                        <p className="min-w-0 flex-1 font-semibold">{i.name}</p>
                        <button onClick={() => remove(i.slug)} aria-label={`Remove ${i.name}`} className="p-2 text-steel hover:text-panther-red"><Trash2 className="h-5 w-5" /></button>
                      </li>
                    ))}
                  </ul>
                  <h3 className="mb-4 mt-8 font-display text-2xl">Your details</h3>
                  <EnquiryForm source="cart" compact withSubject={false} vehicles={items.map(({ slug, name }) => ({ slug, name }))} onSent={clear} />
                </>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
