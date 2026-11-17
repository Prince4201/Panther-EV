import { cache } from 'react';
import type { FinancePartner } from '@/types/finance';
import { API_URL } from './api';
import { cached } from './cache';

/**
 * Server-side: active finance / trusted companies, in the order the admin set. Empty list if the API is down.
 * One source for the Finance page, "Latest from Panther" and the footer (refreshed the moment an admin saves; see lib/cache.ts),
 * so hiding or deleting a partner in Admin > Finance removes it everywhere.
 */
export const getFinancePartners = cache(async (): Promise<FinancePartner[]> => {
  try {
    const res = await fetch(`${API_URL}/finance-partners`, cached('finance'));
    if (!res.ok) throw new Error(String(res.status));
    return ((await res.json()) as { partners: FinancePartner[] }).partners ?? [];
  } catch { return []; }
});

/** Partners that can be shown as a logo. */
export const withLogo = (list: FinancePartner[]) => list.filter((p) => p.logo);
