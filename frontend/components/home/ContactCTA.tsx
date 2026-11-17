import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { site } from '@/data/site';

export function ContactCTA() {
  return (
    <section aria-labelledby="contact-title" className="bg-ink py-20 text-white md:py-32">
      <div className="mx-auto grid max-w-page gap-12 px-5 md:px-10 lg:grid-cols-[6fr_5fr]">
        <div>
          <h2 id="contact-title" className="font-display text-6xl leading-[0.9] md:text-8xl">Contact Panther</h2>
          <p className="mt-5 max-w-md text-white/70">Business enquiries, pre-orders and dealership applications.</p>
          <div className="mt-8"><Button href="/contact" arrow>Enquire now</Button></div>
        </div>
        <ul className="space-y-6 self-end text-lg">
          <li className="flex gap-4"><MapPin className="mt-1 h-5 w-5 shrink-0 text-panther-amber" aria-hidden /><address className="not-italic text-white/85">{site.address.join(', ')}</address></li>
          <li className="flex gap-4"><Mail className="mt-1 h-5 w-5 shrink-0 text-panther-amber" aria-hidden /><a href={`mailto:${site.email}`} className="hover:text-panther-amber">{site.email}</a></li>
          <li className="flex gap-4"><Phone className="mt-1 h-5 w-5 shrink-0 text-panther-amber" aria-hidden /><a href={site.phoneHref} className="hover:text-panther-amber">{site.phone} <span className="text-white/50">(toll free)</span></a></li>
        </ul>
      </div>
    </section>
  );
}
