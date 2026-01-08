import { z } from 'zod';

export const placeBetSelectionSchema = z.object({
  gameId: z.string().uuid(),
  marketId: z.string().uuid(),
  eventId: z.string().uuid(),
  odds: z.number().positive().min(1),
  isLive: z.boolean().optional().default(false),
});

export const placeBetSchema = z.object({
  betType: z.enum(['single', 'multiple', 'system', 'chain']),
  systemVariant: z.string().optional(),
  stake: z.number().positive().min(0.01),
  selections: z.array(placeBetSelectionSchema).min(1).max(50),
  acceptOddsChanges: z.enum(['none', 'higher', 'any']).optional().default('none'),
  source: z.enum(['main_balance', 'bonus_balance']).optional().default('main_balance'),
  freeBetId: z.string().uuid().optional(),
  autoCashoutValue: z.number().positive().optional(),
});

export const betHistoryQuerySchema = z.object({
  status: z.enum(['pending', 'won', 'lost', 'cashout', 'cancelled', 'returned']).optional(),
  betType: z.enum(['single', 'multiple', 'system', 'chain']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const cashoutSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(['full', 'partial']).default('full'),
});

export const betIdParamSchema = z.object({
  betId: z.string().uuid(),
});

export const bookingCodeParamSchema = z.object({
  code: z.string().min(6).max(20),
});

export const createBookingSchema = z.object({
  selections: z.array(placeBetSelectionSchema).min(1).max(50),
});

export type PlaceBetInput = z.infer<typeof placeBetSchema>;
export type BetHistoryQueryInput = z.infer<typeof betHistoryQuerySchema>;
export type CashoutInput = z.infer<typeof cashoutSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
