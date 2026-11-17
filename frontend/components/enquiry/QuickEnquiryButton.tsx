'use client';
import { ArrowRight } from 'lucide-react';
import { useQuickEnquiry } from './QuickEnquiryProvider';
import { cn } from '@/lib/utils';

/** Green call-to-action used for Quick Enquiry everywhere (corner button on desktop, bottom bar on phones, the popup's submit). */
export const quickGreen = 'bg-green-700 text-white transition duration-200 hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:opacity-60';

/** Opens the Quick Enquiry popup over the current page. `onOpen` lets a parent close itself first (e.g. the mobile menu). */
export function QuickEnquiryButton({ className, arrow = true, onOpen, children = 'Quick enquiry' }: { className?: string; arrow?: boolean; onOpen?: () => void; children?: React.ReactNode }) {
  const { open } = useQuickEnquiry();
  return (
    <button type="button" onClick={() => { onOpen?.(); open(); }} aria-haspopup="dialog"
      className={cn('group inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold uppercase tracking-wider', quickGreen, className)}>
      {children}{arrow && <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />}
    </button>
  );
}
