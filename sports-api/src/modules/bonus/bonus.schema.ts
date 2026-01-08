import { z } from 'zod';

// UUID validation for bonus IDs
export const bonusIdParamSchema = z.object({
  id: z.string().uuid('Invalid bonus ID format'),
});

export const bonusListQuerySchema = z.object({
  type: z.enum(['welcome', 'deposit', 'free_bet', 'cashback']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const claimBonusSchema = z.object({
  // No body params needed - bonus ID comes from URL
});

export type BonusIdParam = z.infer<typeof bonusIdParamSchema>;
export type BonusListQueryInput = z.infer<typeof bonusListQuerySchema>;
