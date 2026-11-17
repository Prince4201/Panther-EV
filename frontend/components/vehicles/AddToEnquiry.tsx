'use client';
import { Check, ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { cn } from '@/lib/utils';

export function AddToEnquiry({ slug, name, image, className }: { slug: string; name: string; image: string; className?: string }) {
  const cart = useCart();
  const inCart = cart.has(slug);
  return (
    <button onClick={() => (inCart ? cart.setOpen(true) : cart.add({ slug, name, image }))}
      className={cn('inline-flex items-center justify-center gap-2 border border-ink px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-ink hover:text-white', className)}>
      {inCart ? <Check className="h-4 w-4" aria-hidden /> : <ShoppingCart className="h-4 w-4" aria-hidden />}
      {inCart ? 'In enquiry cart' : 'Add to enquiry'}
    </button>
  );
}
