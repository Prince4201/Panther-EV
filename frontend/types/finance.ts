export type FinanceCategory = 'financing' | 'partner' | 'trusted';
export interface FinancePartner {
  _id: string; name: string; category: FinanceCategory; description: string; logo: string; logoPublicId?: string;
  /** Background the logo was drawn for: "dark" = a white logo that needs a dark card. */
  logoBg?: 'light' | 'dark';
  /** Display size of the logo in percent (50-500). Missing = 100. */
  logoScale?: number;
  website: string; contactPhone: string; contactEmail: string; order: number; active: boolean;
}
export const LOGO_SCALE = { min: 50, max: 500, step: 5, base: 100 } as const;
/** Home page ("Latest from Panther") and footer show this many partners; the Finance page shows all of them. */
export const PARTNER_PREVIEW = 6;
/** A saved logo size, kept inside the allowed range; anything missing or invalid is 100%. */
export const logoScaleOf = (p: { logoScale?: number }) => { const n = Number(p.logoScale); return Number.isFinite(n) && n > 0 ? Math.min(LOGO_SCALE.max, Math.max(LOGO_SCALE.min, n)) : LOGO_SCALE.base; };
/** Inline style that shows a logo at its saved size. Only a transform: the card and its layout never change size. */
export const logoScaleStyle = (p: { logoScale?: number }) => { const s = logoScaleOf(p); return s === LOGO_SCALE.base ? undefined : { transform: `scale(${s / 100})` }; };

export const categoryTitle: Record<FinanceCategory, string> = { financing: 'Finance partners', partner: 'Business partners', trusted: 'Trusted companies' };
export const categoryIntro: Record<FinanceCategory, string> = {
  financing: 'Banks and finance companies that offer loans for Panther vehicles.',
  partner: 'Companies Panther works with.',
  trusted: 'Other companies we trust and recommend.',
};
