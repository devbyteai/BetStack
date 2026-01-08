import { z } from 'zod';

export const jobsListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const jobIdParamSchema = z.object({
  id: z.string().uuid('Invalid job ID format'),
});

export const applyJobBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  resumeUrl: z.string().url('Invalid resume URL').max(500).optional(),
});

export type JobsListQueryInput = z.infer<typeof jobsListQuerySchema>;
export type JobIdParam = z.infer<typeof jobIdParamSchema>;
export type ApplyJobBodyInput = z.infer<typeof applyJobBodySchema>;
