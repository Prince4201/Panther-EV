import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { site } from '@/data/site';

export function ContactCTA() {
  return (
    <section aria-labelledby="contact-title" className="relative overflow-hidden bg-ink py-20 text-white md:py-32">
      {/* Subtle decorative background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(228,32,43,0.06),transparent_50%)]" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,rgba(245,163,0,0.04),transparent_50%)]" aria-hidden />
      <div className="relative mx-auto grid max-w-page gap-12 px-5 md:px-10 lg:grid-cols-[6fr_5fr]">
        <div>
          <h2 id="contact-title" className="font-display text-6xl leading-[0.9] md:text-8xl">Contact Panther</h2>
          <p className="mt-5 max-w-md text-white/70">Business enquiries, pre-orders and dealership applications.</p>
          <div className="mt-8"><Button href="/contact" arrow>Enquire now</Button></div>
        </div>
        <ul className="space-y-6 self-end text-lg">
          <li className="flex gap-4 group"><MapPin className="mt-1 h-5 w-5 shrink-0 text-panther-amber transition-transform group-hover:scale-110" aria-hidden /><address className="not-italic text-white/85">{site.address.join(', ')}</address></li>
          <li className="flex gap-4 group"><Mail className="mt-1 h-5 w-5 shrink-0 text-panther-amber transition-transform group-hover:scale-110" aria-hidden /><a href={`mailto:${site.email}`} className="transition-colors hover:text-panther-amber">{site.email}</a></li>
          <li className="flex gap-4 group"><Phone className="mt-1 h-5 w-5 shrink-0 text-panther-amber transition-transform group-hover:scale-110" aria-hidden /><a href={site.phoneHref} className="transition-colors hover:text-panther-amber">{site.phone} <span className="text-white/50">(toll free)</span></a></li>
        </ul>
      </div>
    </section>
  );
}
