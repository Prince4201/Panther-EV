import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, 'Enter a valid phone number').optional().or(z.literal('')),
  password: z.string().min(8, 'Use at least 8 characters').max(200),
}).strict();

// Quick Enquiry popup: name, phone and message only. Indian mobile number: 10 digits starting 6-9, with an optional
// +91 / 0 prefix and spaces or dashes. Not strict: anything else an older open page still sends is simply dropped.
export const quickInquirySchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  phone: z.string().trim().max(20).transform((v) => v.replace(/[\s-]/g, '').replace(/^(\+?91|0)(?=\d{10}$)/, '')).pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number')),
  message: z.string().trim().min(1, 'Tell us what you are looking for').max(1500),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, 'Enter a valid phone number'),
  city: z.string().trim().max(80).optional().default(''),
  subject: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().max(1500).optional().default(''),
  vehicles: z.array(z.object({ slug: z.string().max(80), name: z.string().max(120) })).max(10).optional().default([]),
  country: z.string().trim().length(2).optional().default('IN'),
  source: z.enum(['cart', 'contact']).default('contact'),
}).strict();
