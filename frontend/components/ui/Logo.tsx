import Image from 'next/image';
import { cn } from '@/lib/utils';

/** The black panther disappears on dark backgrounds, so dark surfaces use a transparent variant with the black parts lightened (no plate). */
export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <Image src={onDark ? '/brand/panther-logo-dark.png' : '/brand/panther-logo.png'} alt="Panther" width={391} height={186} priority className="h-9 w-auto md:h-11" />
    </span>
  );
}
