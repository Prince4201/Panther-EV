import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { news } from '@/data/news';

type Props = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => news.map((n) => ({ slug: n.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = news.find((x) => x.slug === slug);
  return n ? { title: n.title, description: n.excerpt, alternates: { canonical: `/news/${n.slug}` } } : {};
}

export default async function NewsArticle({ params }: Props) {
  const { slug } = await params;
  const n = news.find((x) => x.slug === slug);
  if (!n) notFound();
  return (
    <>
      <PageHeader title={n.title} />
      <article className="mx-auto max-w-3xl space-y-4 px-5 py-12 text-lg md:px-10">{n.body.map((para, i) => <p key={i}>{para}</p>)}</article>
    </>
  );
}
