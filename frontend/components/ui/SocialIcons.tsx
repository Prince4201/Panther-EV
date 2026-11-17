import { cn } from '@/lib/utils';

type Key = 'facebook' | 'instagram' | 'whatsapp' | 'youtube';

const paths: Record<Key, string> = {
  facebook: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z',
  instagram: 'M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z',
  whatsapp: 'M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 012.89 6.99c0 5.45-4.44 9.88-9.88 9.88zM20.52 3.45A11.8 11.8 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41z',
  youtube: 'M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z',
};

// Each platform keeps its own brand colour (white glyph on the brand-coloured disc) and a matching soft glow on hover.
const brand: Record<Key, { aria: string; style: React.CSSProperties; glow: string }> = {
  facebook: { aria: 'Panther on Facebook', style: { backgroundColor: '#1877F2' }, glow: 'hover:shadow-[0_8px_22px_-6px_rgba(24,119,242,0.75)]' },
  instagram: { aria: 'Panther on Instagram', style: { backgroundImage: 'radial-gradient(circle at 30% 107%, #FDF497 0%, #FDF497 5%, #FD5949 45%, #D6249F 60%, #285AEB 90%)' }, glow: 'hover:shadow-[0_8px_22px_-6px_rgba(214,36,159,0.75)]' },
  whatsapp: { aria: 'Contact Panther on WhatsApp', style: { backgroundColor: '#25D366' }, glow: 'hover:shadow-[0_8px_22px_-6px_rgba(37,211,102,0.75)]' },
  youtube: { aria: 'Panther on YouTube', style: { backgroundColor: '#FF0000' }, glow: 'hover:shadow-[0_8px_22px_-6px_rgba(255,0,0,0.7)]' },
};

/** Footer social links in each platform's own colours. 44px touch targets, keyboard focus ring, small lift on hover. */
export function SocialIcons({ items, className }: { items: ReadonlyArray<{ key: string; label: string; href: string }>; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-3', className)}>
      {items.filter((s): s is typeof s & { key: Key } => s.key in paths).map((s) => (
        <li key={s.key}>
          <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={brand[s.key].aria} title={s.label} style={brand[s.key].style}
            className={cn('flex h-11 w-11 items-center justify-center rounded-full text-white transition duration-[250ms] ease-out hover:-translate-y-0.5 hover:scale-[1.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panther-amber motion-reduce:transition-none motion-reduce:hover:transform-none', brand[s.key].glow)}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true" focusable="false"><path d={paths[s.key]} /></svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
