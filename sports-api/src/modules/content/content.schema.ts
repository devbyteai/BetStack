import { z } from 'zod';

export const bannersQuerySchema = z.object({
  position: z.enum(['home', 'casino', 'sports', 'featured']).optional(),
});

export const newsListQuerySchema = z.object({
  category: z.string().max(50).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// UUID validation for news IDs
export const newsIdParamSchema = z.object({
  id: z.string().uuid('Invalid news ID format'),
});

// Slug validation for info pages (alphanumeric, hyphens, underscores)
export const infoSlugParamSchema = z.object({
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-_]+$/, 'Invalid slug format'),
});

// Franchise inquiry validation
export const franchiseInquirySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email too long'),
  phone: z.string()
    .min(9, 'Phone number must be at least 9 digits')
    .max(20, 'Phone number too long')
    .regex(/^[+\d\s()-]+$/, 'Invalid phone number format'),
  location: z.string()
    .min(2, 'Location must be at least 2 characters')
    .max(200, 'Location must be less than 200 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

export type BannersQueryInput = z.infer<typeof bannersQuerySchema>;
export type NewsListQueryInput = z.infer<typeof newsListQuerySchema>;
export type NewsIdParam = z.infer<typeof newsIdParamSchema>;
export type InfoSlugParam = z.infer<typeof infoSlugParamSchema>;
export type FranchiseInquiryInput = z.infer<typeof franchiseInquirySchema>;
