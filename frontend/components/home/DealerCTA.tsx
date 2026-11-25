import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function DealerCTA() {
  return (
    <section aria-label="Dealers" className="grid lg:grid-cols-2">
      <div className="bg-white px-5 py-16 md:px-16 md:py-24">
        <h2 className="font-display text-5xl leading-[0.9] md:text-7xl">Find a dealer</h2>
        <p className="mt-4 max-w-md text-steel">Search by state, city or pincode to find your nearest Panther dealer.</p>
        <form action="/dealers" method="get" className="mt-8 grid max-w-md gap-4">
          <div>
            <label htmlFor="dealer-q" className="mb-1.5 block text-sm font-semibold">State, city or pincode</label>
            <div className="flex">
              <input id="dealer-q" name="q" required placeholder="e.g. Meerut or 250002" className="w-full rounded-l-lg border border-ink px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-panther-amber transition-shadow" />
              <button type="submit" aria-label="Search dealers" className="rounded-r-lg bg-ink px-5 text-white transition-colors duration-200 hover:bg-panther-red"><MapPin className="h-5 w-5" /></button>
            </div>
          </div>
        </form>
      </div>
      <div className="relative overflow-hidden bg-panther-red px-5 py-16 text-white md:px-16 md:py-24">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.08),transparent_40%)]" aria-hidden />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" aria-hidden />
        <div className="relative">
          <h2 className="font-display text-5xl leading-[0.9] md:text-7xl">Become a Panther dealer</h2>
          <p className="mt-4 max-w-md text-white/85">Partner with a brand that has put 80,000+ vehicles on Indian roads. Tell us about your business and we will get back to you.</p>
          <div className="mt-8"><Button href="/dealership" variant="outline" arrow>Apply for dealership</Button></div>
        </div>
      </div>
    </section>
  );
}
