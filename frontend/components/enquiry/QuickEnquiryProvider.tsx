'use client';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { QuickEnquiryModal } from './QuickEnquiryModal';
import { QuickEnquiryFab } from './QuickEnquiryFab';

interface Ctx { open: () => void; close: () => void; isOpen: boolean }
const QuickEnquiryContext = createContext<Ctx>({ open: () => {}, close: () => {}, isOpen: false });
export const useQuickEnquiry = () => useContext(QuickEnquiryContext);

/** One Quick Enquiry popup for the whole public site. The corner button (desktop) and the bottom bar (phones) open it; the URL never changes. */
export function QuickEnquiryProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);
  return (
    <QuickEnquiryContext.Provider value={value}>
      {children}
      <QuickEnquiryFab />
      <AnimatePresence>{isOpen && <QuickEnquiryModal onClose={close} />}</AnimatePresence>
    </QuickEnquiryContext.Provider>
  );
}
