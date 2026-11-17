'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface CartItem { slug: string; name: string; image: string }
interface Ctx {
  items: CartItem[]; open: boolean; setOpen: (o: boolean) => void;
  has: (slug: string) => boolean; add: (i: CartItem) => void; remove: (slug: string) => void; clear: () => void;
}
const KEY = 'panther-enquiry-cart';
const CartContext = createContext<Ctx | null>(null);
export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart must be used inside <CartProvider>');
  return c;
};

/** Vehicle enquiry cart. Kept in the browser; the items are sent with the enquiry form. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)); } catch { /* storage blocked */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage blocked */ }
  }, [items, ready]);

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);
  const add = useCallback((i: CartItem) => { setItems((s) => (s.some((x) => x.slug === i.slug) || s.length >= 10 ? s : [...s, i])); setOpen(true); }, []);
  const remove = useCallback((slug: string) => setItems((s) => s.filter((x) => x.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ items, open, setOpen, has, add, remove, clear }), [items, open, has, add, remove, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
