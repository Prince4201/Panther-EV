'use client';
import { MessageCircle } from 'lucide-react';
import { useQuickEnquiry } from './QuickEnquiryProvider';
import { quickGreen } from './QuickEnquiryButton';

/**
 * Desktop: green Quick Enquiry button fixed to the bottom-right corner of every public page (never in the navbar).
 * Below `lg` the same action lives in the green bottom bar (StickyEnquiry), so this one is hidden there.
 */
export function QuickEnquiryFab() {
  const { open, isOpen } = useQuickEnquiry();
  if (isOpen) return null;
  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      className={`fixed bottom-6 right-6 z-40 hidden items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold uppercase tracking-wider shadow-[0_10px_28px_-8px_rgba(21,128,61,0.75)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-8px_rgba(21,128,61,0.85)] motion-reduce:hover:translate-y-0 lg:inline-flex ${quickGreen}`}
    >
      <MessageCircle className="h-5 w-5" aria-hidden />
      Quick enquiry
    </button>
  );
}
