import { z } from 'zod';

const httpUrl = z.string().trim().url().refine((u) => /^https?:\/\//i.test(u), 'Use a link that starts with http:// or https://');
const optionalHttpUrl = z.union([httpUrl, z.literal('')]).default('');
// Buttons may link inside the site ("/vehicles") or to a full web address.
// Images may be a full web address (Cloudinary) or a file shipped with the site ("/hero/panther-blue.jpg").
const imageUrl = z.union([httpUrl, z.string().trim().regex(/^\/[^\s]+\.(jpe?g|png|webp|avif)$/i, 'Use a link that starts with http:// or https://')]);
const linkUrl = z.union([z.string().trim().regex(/^\/[^\s]*$/, 'Start internal links with /'), httpUrl, z.literal('')]).default('');

export const heroSlideSchema = z.object({
  title: z.string().trim().min(1, 'Add a title').max(120),
  subtitle: z.string().trim().max(200).default(''),
  description: z.string().trim().max(400).default(''),
  image: imageUrl,
  imagePublicId: z.string().default(''),
  mobileImage: optionalHttpUrl,
  mobileImagePublicId: z.string().default(''),
  imageAlt: z.string().trim().max(200).default(''),
  fit: z.enum(['cover', 'contain']).default('cover'),
  bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a colour like #EEF0F2').default('#EEF0F2'),
  textColor: z.enum(['dark', 'light']).default('dark'),
  textAlign: z.enum(['left', 'center', 'right']).default('left'),
  overlay: z.coerce.number().min(0).max(100).default(0),
  button1Text: z.string().trim().max(40).default(''),
  button1Url: linkUrl,
  button2Text: z.string().trim().max(40).default(''),
  button2Url: linkUrl,
  active: z.boolean().default(true),
  duration: z.coerce.number().int().min(2000).max(20000).nullable().default(null),
}).strict();

export const heroSlideUpdateSchema = heroSlideSchema.partial();
export const reorderSchema = z.object({ ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1) });

export const heroSettingsSchema = z.object({
  autoplay: z.boolean(),
  duration: z.coerce.number().int().min(2000).max(20000),
  pauseOnHover: z.boolean(),
  showIndicators: z.boolean(),
  showArrows: z.boolean(),
  transition: z.enum(['fade', 'slide']),
}).strict();

export const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(200) }).strict();
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(10, 'Use at least 10 characters').max(200) }).strict();
