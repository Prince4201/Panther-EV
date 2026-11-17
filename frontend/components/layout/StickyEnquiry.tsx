'use client';
import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';
import { site } from '@/data/site';
import { QuickEnquiryButton } from '@/components/enquiry/QuickEnquiryButton';

/** Mobile-only bottom bar: Quick Enquiry (opens the popup on the current page) and a call button. Hidden on pages that are already enquiry forms. */
export function StickyEnquiry() {
  const path = usePathname();
  if (path.startsWith('/contact') || path.startsWith('/admin') || path.startsWith('/dealership')) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[1fr_auto] border-t border-line bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
      <QuickEnquiryButton className="py-4 text-sm" />
      <a href={site.phoneHref} aria-label={`Call Panther on ${site.phone}`} className="flex items-center px-6 text-ink"><Phone className="h-5 w-5" /></a>
    </div>
  );
}
