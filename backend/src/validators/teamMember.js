import { z } from 'zod';

const httpUrl = z.string().trim().url().refine((u) => /^https?:\/\//i.test(u), 'Use a link that starts with http:// or https://');
// A photo is a full web address (Cloudinary) or a file shipped with the site ("/team/name.jpg").
const imageUrl = z.union([httpUrl, z.string().trim().regex(/^\/[^\s]+\.(jpe?g|png|webp|avif)$/i, 'Use a link that starts with http:// or https://'), z.literal('')]).default('');

// Every field is optional. The controller rejects a record that has no name, role and photo at all.
export const teamMemberSchema = z.object({
  name: z.string().trim().max(120).default(''),
  designation: z.string().trim().max(120).default(''),
  email: z.union([z.string().trim().max(120).email('Enter a valid email'), z.literal('')]).default(''),
  image: imageUrl,
  imagePublicId: z.string().max(200).default(''),
  imageScale: z.coerce.number().int('Use a whole number').min(50, 'Minimum is 50%').max(500, 'Maximum is 500%').default(100),
  imagePosX: z.coerce.number().min(-100).max(100).default(0),
  imagePosY: z.coerce.number().min(-100).max(100).default(0),
  description: z.string().trim().max(1000).default(''),
  experience: z.string().trim().max(120).default(''),
  additionalInfo: z.string().trim().max(1000).default(''),
  displayOrder: z.coerce.number().int().min(0).max(9999).optional(),
  isVisible: z.boolean().default(true),
}).strict();

export const teamMemberUpdateSchema = teamMemberSchema.partial();
