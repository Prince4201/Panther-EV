import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'outline' | 'outlineDark' | 'ghost';
const styles: Record<Variant, string> = {
  primary: 'bg-panther-red text-white hover:bg-[#c4161c] hover:shadow-lg hover:shadow-panther-red/25 active:scale-[0.98]',
  outline: 'border border-white/70 text-white hover:bg-white hover:text-ink active:scale-[0.98]',
  outlineDark: 'border border-ink text-ink hover:bg-ink hover:text-white active:scale-[0.98]',
  ghost: 'text-current hover:text-panther-red px-0',
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
