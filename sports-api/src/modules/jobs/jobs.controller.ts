import type { Request, Response, NextFunction } from 'express';
import { jobsService } from './jobs.service.js';
import type { JobsListQueryInput, ApplyJobBodyInput } from './jobs.schema.js';

export class JobsController {
  async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as JobsListQueryInput;
      const result = await jobsService.getJobs(query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const job = await jobsService.getJobById(id);

      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  async applyForJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body as ApplyJobBodyInput;
      const application = await jobsService.applyForJob(id, body);

      res.status(201).json({
        success: true,
        data: application,
        message: 'Application submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const jobsController = new JobsController();
