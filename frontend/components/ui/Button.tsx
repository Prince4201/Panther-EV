import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'outlineDark' | 'ghost' | 'emerald';
const styles: Record<Variant, string> = {
  primary:
    'relative overflow-hidden rounded-full bg-gradient-to-r from-panther-red via-[#E8222E] to-[#B8101C] text-white shadow-[0_6px_20px_-2px_rgba(228,32,43,0.45)] hover:shadow-[0_10px_28px_-2px_rgba(228,32,43,0.65)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border border-white/20',
  secondary:
    'rounded-full bg-ink text-white shadow-md shadow-ink/20 hover:bg-panther-red hover:shadow-lg hover:shadow-panther-red/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border border-white/10',
  outline:
    'rounded-full border border-white/80 bg-white/10 text-white backdrop-blur-md shadow-sm hover:bg-white hover:text-ink hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]',
  outlineDark:
    'rounded-full border border-ink/80 bg-white/80 text-ink shadow-sm hover:bg-ink hover:text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]',
  emerald:
    'rounded-full bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-[0_6px_20px_-2px_rgba(16,185,129,0.4)] hover:shadow-[0_10px_28px_-2px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 active:scale-[0.98]',
  ghost:
    'text-current hover:text-panther-red px-0 rounded-none',
};

export function Button({ href, variant = 'primary', arrow, className, children, ...rest }: {
  href: string; variant?: Variant; arrow?: boolean; className?: string; children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <Link
      href={href}
      className={cn('group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all duration-200', styles[variant], className)}
      {...rest}
    >
      {children}
      {arrow && <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />}
    </Link>
  );
}
