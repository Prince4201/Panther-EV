export interface NewsItem { slug: string; title: string; date: string; excerpt: string; body: string[]; image?: string }
// No news is published on pantherev.com yet. Items added here (or later in Admin) appear on /news automatically.
export const news: NewsItem[] = [];
