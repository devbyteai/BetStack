import { z } from 'zod';

export const depositSchema = z.object({
  amount: z.number().positive().min(1).max(10000),
  paymentProvider: z.enum(['mtn', 'vodafone', 'airteltigo']),
  phoneNumber: z.string().min(10).max(15).regex(/^\d+$/, 'Phone number must contain only digits'),
});

export const withdrawSchema = z.object({
  amount: z.number().positive().min(1).max(10000),
  paymentProvider: z.enum(['mtn', 'vodafone', 'airteltigo']),
  phoneNumber: z.string().min(10).max(15).regex(/^\d+$/, 'Phone number must contain only digits'),
  password: z.string().min(1),
});

export const transactionHistoryQuerySchema = z.object({
  type: z.enum(['deposit', 'withdrawal', 'bet', 'win', 'bonus', 'bonus_withdrawal', 'cashout']).optional(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const paymentCallbackSchema = z.object({
  transactionId: z.string().uuid(),
  status: z.enum(['success', 'failed']),
  externalRef: z.string(),
  amount: z.number().positive(),
  provider: z.enum(['mtn', 'vodafone', 'airteltigo']),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const withdrawalIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type DepositInput = z.infer<typeof depositSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type TransactionHistoryQueryInput = z.infer<typeof transactionHistoryQuerySchema>;
export type PaymentCallbackInput = z.infer<typeof paymentCallbackSchema>;
