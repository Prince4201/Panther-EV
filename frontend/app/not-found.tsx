import { Providers } from '@/components/layout/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { getCatalog } from '@/lib/catalog';

// Rendered for every unknown URL. Includes the site chrome so visitors can keep navigating.
export default async function NotFound() {
  const catalog = await getCatalog();
  return (
    <Providers catalog={catalog}>
      <Navbar />
      <main id="main" className="pt-[72px] lg:pt-[80px]">
        <section className="flex min-h-[70svh] flex-col items-start justify-center bg-ink px-5 py-16 text-white md:px-10">
          <p className="font-display text-[28vw] leading-none text-panther-red md:text-[14rem]" aria-hidden>404</p>
          <h1 className="font-display text-4xl md:text-6xl">Page not found</h1>
          <p className="mt-4 max-w-md text-white/70">The page may have moved or the link is wrong. Try one of these instead.</p>
          <div className="mt-8 flex flex-wrap gap-4"><Button href="/">Go to homepage</Button><Button href="/vehicles" variant="outline">Explore vehicles</Button></div>
        </section>
      </main>
      <Footer />
    </Providers>
  );
}
