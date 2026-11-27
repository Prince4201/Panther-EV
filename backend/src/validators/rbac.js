import { z } from 'zod';
import { INQUIRY_STATUSES, PERMISSION_KEYS } from '../lib/permissions.js';

const oid = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
const phone = z.union([z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, 'Enter a valid phone number'), z.literal('')]);
export const strongPassword = z.string().min(8, 'Use at least 8 characters').max(200)
  .regex(/[A-Za-z]/, 'Include at least one letter').regex(/[0-9]/, 'Include at least one number');

export const avatarUrl = z.union([
  z.string().trim().refine((u) => /^https?:\/\//i.test(u) || u.startsWith('/') || /^data:image\//i.test(u), 'Provide a valid image URL or upload an image'),
  z.literal(''),
]);

export const addressSchema = z.object({
  line1: z.string().trim().max(160).default(''),
  city: z.string().trim().max(80).default(''),
  state: z.string().trim().max(80).default(''),
  pincode: z.string().trim().max(12).regex(/^[A-Za-z0-9\- ]*$/, 'Enter a valid pincode').default(''),
  country: z.string().trim().max(80).default('India'),
}).strict();

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  phone: phone.default(''),
  address: addressSchema.optional(),
  avatar: avatarUrl.optional(),
}).strict();

export const changeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password').max(200),
  newPassword: strongPassword,
  confirmPassword: z.string().max(200),
}).strict().refine((d) => d.newPassword === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
  .refine((d) => d.newPassword !== d.currentPassword, { path: ['newPassword'], message: 'Choose a password you have not used just now' });

export const forgotSchema = z.object({ email: z.string().trim().email('Enter a valid email').max(120) }).strict();
export const resetSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/, 'This reset link is not valid'),
  newPassword: strongPassword,
  confirmPassword: z.string().max(200),
}).strict().refine((d) => d.newPassword === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

const perms = z.array(z.enum(PERMISSION_KEYS)).max(PERMISSION_KEYS.length).transform((a) => [...new Set(a)]);
const avatar = avatarUrl;
// There is deliberately no "role" field (and the schemas are strict, so sending one is rejected):
// accounts created or edited here are always plain admins. Super admins exist only via the seed.
export const createAdminSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(80),
  email: z.string().trim().email('Enter a valid email').max(120),
  phone: phone.default(''),
  avatar: avatar.default(''),
  password: strongPassword,
  permissions: perms.default([]),
  active: z.boolean().default(true),
}).strict();
export const updateAdminSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(80),
  email: z.string().trim().email('Enter a valid email').max(120),
  phone: phone,
  avatar: avatar,
  permissions: perms,
  active: z.boolean(),
}).partial().strict();
export const resetAdminPasswordSchema = z.object({ password: strongPassword }).strict();

export const customerStatusSchema = z.object({ active: z.boolean() }).strict();

export const assignSchema = z.object({ adminId: oid }).strict();
export const statusSchema = z.object({ status: z.enum(INQUIRY_STATUSES), note: z.string().trim().max(2000).optional().default('') }).strict();
export const noteSchema = z.object({
  type: z.enum(['note', 'progress', 'report']).default('note'),
  message: z.string().trim().min(1, 'Write something first').max(2000),
  visibility: z.enum(['internal', 'customer']).default('internal'),
}).strict();

const specs = z.array(z.object({ label: z.string().trim().min(1).max(60), value: z.string().trim().max(200).nullable().default(null) })).max(30);
const httpsOrLocal = z.union([z.string().trim().url().refine((u) => /^https?:\/\//i.test(u)), z.string().trim().regex(/^\/[^\s]+\.(jpe?g|png|webp|avif)$/i), z.literal('')]);
export const productSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes').max(80),
  name: z.string().trim().min(1, 'Add a name').max(120),
  // The key of a vehicle category. Whether that category exists (and is active) is checked against the database in the controller.
  category: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Choose a category').max(80),
  tag: z.string().trim().max(40).default(''),
  summary: z.string().trim().max(300).default(''),
  description: z.string().trim().max(4000).default(''),
  image: httpsOrLocal.default(''),
  imagePublicId: z.string().max(200).default(''),
  gallery: z.array(z.object({ url: httpsOrLocal, publicId: z.string().max(200).default('') })).max(10).default([]),
  specs: specs.default([]),
  price: z.coerce.number().min(0).max(100000000).nullable().default(null),
  active: z.boolean().default(true),
}).strict();
export const productUpdateSchema = productSchema.partial();

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Add the category name').max(80),
  description: z.string().trim().max(400).default(''),
  active: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(9999).optional(),
}).strict();
export const categoryUpdateSchema = categorySchema.partial();
