import { z } from 'zod';

// UUID validation for game IDs
export const gameIdParamSchema = z.object({
  id: z.string().uuid('Invalid game ID format'),
});

export const casinoGamesQuerySchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  categorySlug: z.string().max(50).optional(),
  providerId: z.coerce.number().int().positive().optional(),
  providerCode: z.string().max(50).optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const gameLaunchSchema = z.object({
  mode: z.enum(['real', 'demo']).default('real'),
});

export type GameIdParam = z.infer<typeof gameIdParamSchema>;
export type CasinoGamesQueryInput = z.infer<typeof casinoGamesQuerySchema>;
export type GameLaunchInput = z.infer<typeof gameLaunchSchema>;
