import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Providers } from '@/components/layout/Providers';
import { StickyEnquiry } from '@/components/layout/StickyEnquiry';
import { getCatalog } from '@/lib/catalog';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Vehicles and categories come from the database, so menus, search and listings follow Admin > Vehicles.
  const catalog = await getCatalog();
  return (
    <Providers catalog={catalog}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <Navbar />
      {/* The navbar is fixed and always solid white, so content starts below it instead of behind it. */}
      <main id="main" className="pt-[72px] lg:pt-[80px]">{children}</main>
      <Footer />
      <StickyEnquiry />
    </Providers>
  );
}
