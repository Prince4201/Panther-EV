import { z } from 'zod';

const httpUrl = z.string().trim().url().refine((u) => /^https?:\/\//i.test(u), 'Use a link that starts with http:// or https://');
const optionalUrl = z.union([httpUrl, z.literal('')]).default('');
// A logo is a full web address (Cloudinary) or a file shipped with the site ("/partners/bank.png").
const logoUrl = z.union([httpUrl, z.string().trim().regex(/^\/[^\s]+\.(jpe?g|png|webp|avif|svg)$/i, 'Use a link that starts with http:// or https://'), z.literal('')]).default('');

export const financePartnerSchema = z.object({
  name: z.string().trim().min(1, 'Add the company name').max(120),
  category: z.enum(['financing', 'partner', 'trusted']).default('financing'),
  description: z.string().trim().max(400).default(''),
  logo: logoUrl,
  logoPublicId: z.string().default(''),
  logoBg: z.enum(['light', 'dark']).default('light'),
  logoScale: z.coerce.number().int('Use a whole number').min(50, 'Minimum is 50%').max(500, 'Maximum is 500%').default(100),
  website: optionalUrl,
  contactPhone: z.string().trim().max(30).default(''),
  contactEmail: z.union([z.string().trim().email('Enter a valid email'), z.literal('')]).default(''),
  active: z.boolean().default(true),
}).strict();

export const financePartnerUpdateSchema = financePartnerSchema.partial();
