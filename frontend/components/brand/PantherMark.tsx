import { cn } from '@/lib/utils';

/**
 * Original geometric "P" for Panther: a bold, forward-leaning stem, a forward-pointing chevron bowl (speed),
 * and a red block at the foot of the stem that echoes the red swoosh in the Panther logo.
 * `currentColor` controls the P, so it works on white (ink) and on dark (white) surfaces.
 */
export function PantherMark({ className, title = 'Panther' }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label={title} className={cn('h-9 w-9', className)}>
      <g transform="translate(8 0) skewX(-10)">
      <path fillRule="evenodd" fill="currentColor" d="M6 4H30L42 16V24L30 36H18V44H6ZM18 14V26H28L32 22V18L28 14Z" />
      <path fill="#E4202B" d="M6 33H18V44H6Z" />
    </g>
    </svg>
  );
}
