import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Public_Sans } from 'next/font/google';
import './globals.css';
import { site } from '@/data/site';

const display = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display', display: 'swap' });
const body = Public_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'Panther EV – Electric rickshaws built for power and business', template: '%s | Panther EV' },
  description: 'Panther Electric Vehicles makes heavy-duty passenger and cargo e-rickshaws for Indian roads. Explore the range, find a dealer or become one.',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: site.name, url: site.url, title: 'Panther EV', description: 'Reliable electric mobility built for Indian roads and real-world business.' },
  twitter: { card: 'summary_large_image', title: 'Panther EV' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
