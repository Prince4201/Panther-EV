import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { news } from '@/data/news';
import { site } from '@/data/site';

export const metadata: Metadata = { title: 'News', description: 'News and updates from Panther EV.', alternates: { canonical: '/news' } };

export default function NewsPage() {
  return (
    <>
      <PageHeader title="News" intro="Updates from Panther EV." />
      <section className="mx-auto max-w-page px-5 py-14 md:px-10 md:py-20">
        {news.length === 0 ? (
          <div className="border border-dashed border-line p-8 md:p-12">
            <p className="font-display text-4xl">No news published yet</p>
            <p className="mt-2 max-w-lg text-steel">Follow Panther on its channels for the latest vehicles and updates.</p>
            <ul className="mt-6 flex flex-wrap gap-3">{site.social.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-block border border-ink px-5 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-ink hover:text-white">{s.label}</a></li>)}</ul>
            <div className="mt-6"><Button href="/" variant="ghost">Back to homepage</Button></div>
          </div>
        ) : (
          <ul className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {news.map((n) => (
              <li key={n.slug} className="border-t border-ink pt-4"><time dateTime={n.date} className="text-sm text-steel">{new Date(n.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                <h2 className="mt-1 font-display text-3xl"><Link href={`/news/${n.slug}`} className="hover:text-panther-red">{n.title}</Link></h2><p className="mt-2 text-steel">{n.excerpt}</p></li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
