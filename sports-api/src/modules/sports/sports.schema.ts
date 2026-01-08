import { z } from 'zod';

export const getSportsQuerySchema = z.object({
  type: z.enum(['prematch', 'live']).optional(),
});

export const getRegionsParamsSchema = z.object({
  sportId: z.coerce.number().int().positive(),
});

export const getCompetitionsParamsSchema = z.object({
  regionId: z.coerce.number().int().positive(),
});

export const getGamesQuerySchema = z.object({
  sportId: z.coerce.number().int().positive().optional(),
  regionId: z.coerce.number().int().positive().optional(),
  competitionId: z.coerce.number().int().positive().optional(),
  type: z.enum(['prematch', 'live', 'finished']).optional(),
  startsWithin: z.coerce.number().int().min(1).max(1440).optional(), // Minutes (max 24 hours)
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const getGameParamsSchema = z.object({
  gameId: z.string().uuid(),
});

export const getGameQuerySchema = z.object({
  withMarkets: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
});

export const searchGamesQuerySchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type GetSportsQuery = z.infer<typeof getSportsQuerySchema>;
export type GetRegionsParams = z.infer<typeof getRegionsParamsSchema>;
export type GetCompetitionsParams = z.infer<typeof getCompetitionsParamsSchema>;
export type GetGamesQuery = z.infer<typeof getGamesQuerySchema>;
export type GetGameParams = z.infer<typeof getGameParamsSchema>;
export type GetGameQuery = z.infer<typeof getGameQuerySchema>;
export type SearchGamesQuery = z.infer<typeof searchGamesQuerySchema>;
