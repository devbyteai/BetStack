import { Router } from 'express';
import { jobsController } from './jobs.controller.js';
import { validateQuery, validateParams, validateBody } from '../../shared/middleware/index.js';
import { jobsListQuerySchema, jobIdParamSchema, applyJobBodySchema } from './jobs.schema.js';

const router = Router();

// Get all active jobs
router.get(
  '/',
  validateQuery(jobsListQuerySchema),
  jobsController.getJobs.bind(jobsController)
);

// Get single job details
router.get(
  '/:id',
  validateParams(jobIdParamSchema),
  jobsController.getJobById.bind(jobsController)
);

// Apply for a job
router.post(
  '/:id/apply',
  validateParams(jobIdParamSchema),
  validateBody(applyJobBodySchema),
  jobsController.applyForJob.bind(jobsController)
);

export { router as jobsRoutes };
