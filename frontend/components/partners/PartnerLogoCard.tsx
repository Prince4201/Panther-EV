import { logoScaleStyle, type FinancePartner } from '@/types/finance';
import { cn } from '@/lib/utils';

type Size = 'lg' | 'md' | 'sm';
const pad: Record<Size, string> = { lg: 'p-6 md:p-7', md: 'p-5', sm: 'px-4 py-3' };
const logoBox: Record<Size, string> = { lg: 'h-20', md: 'h-14', sm: 'h-9' };

/**
 * One finance partner as a clickable logo card. The logo file is shown as supplied (object-fit: contain, never stretched
 * or recoloured), at the size set in Admin > Finance (logoScale, centred, aspect ratio kept). White logos (logoBg = "dark") get a dark card so they stay readable.
 * The link is a normal same-tab link, so the browser's Back button returns to Panther.
 */
export function PartnerLogoCard({ partner: p, size = 'md', onDark = false, showName = false, className }: { partner: FinancePartner; size?: Size; onDark?: boolean; showName?: boolean; className?: string }) {
  const dark = p.logoBg === 'dark';
  const cls = cn(
    // overflow-hidden: an enlarged logo is clipped by the card instead of spilling out of it.
    'partner-card flex h-full flex-col items-center justify-center overflow-hidden border',
    pad[size],
    dark ? cn('bg-ink', onDark ? 'border-white/25' : 'border-ink') : cn('bg-[#F7F7F7]', onDark ? 'border-transparent' : 'border-line'),
    p.website && 'cursor-pointer',
    className,
  );
  const body = (
    <>
      {/* The logo area clips an enlarged logo, so it can never run over the company name or out of the card. */}
      <span className={cn('flex w-full items-center justify-center overflow-hidden', logoBox[size])}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.logo ? <img src={p.logo} alt={`${p.name} logo`} loading="lazy" decoding="async" style={logoScaleStyle(p)} className="h-full w-full object-contain" />
          : <span className={cn('text-center font-display text-2xl leading-none', dark && 'text-white')}>{p.name}</span>}
      </span>
      {showName && p.logo && <span className={cn('relative mt-4 block text-center text-xs font-semibold uppercase tracking-wider', dark ? 'text-white/70' : 'text-steel')}>{p.name}</span>}
    </>
  );
  return p.website
    ? <a href={p.website} rel="external" aria-label={`${p.name} – visit website`} className={cls}>{body}</a>
    : <div className={cls}>{body}</div>;
}
