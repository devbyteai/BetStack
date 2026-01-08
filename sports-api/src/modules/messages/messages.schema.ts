import { z } from 'zod';

export const messagesListQuerySchema = z.object({
  type: z.enum(['system', 'promotion', 'announcement', 'alert']).optional(),
  includeRead: z.coerce.boolean().optional().default(true),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const messageIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const markReadBodySchema = z.object({
  messageIds: z.array(z.string().uuid()).min(1).max(50),
});

export const dismissBodySchema = z.object({
  messageId: z.string().uuid(),
});

export type MessagesListQueryInput = z.infer<typeof messagesListQuerySchema>;
export type MessageIdParamInput = z.infer<typeof messageIdParamSchema>;
export type MarkReadBodyInput = z.infer<typeof markReadBodySchema>;
export type DismissBodyInput = z.infer<typeof dismissBodySchema>;
