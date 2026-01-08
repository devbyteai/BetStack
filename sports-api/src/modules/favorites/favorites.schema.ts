import { z } from 'zod';

export const createFavoriteSchema = z.object({
  gameId: z.string().uuid().optional(),
  competitionId: z.number().int().positive().optional(),
}).refine(
  (data) => data.gameId || data.competitionId,
  { message: 'Either gameId or competitionId must be provided' }
);

export const deleteFavoriteParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;
export type DeleteFavoriteParams = z.infer<typeof deleteFavoriteParamsSchema>;
