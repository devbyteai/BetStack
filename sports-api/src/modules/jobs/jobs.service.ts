import { db } from '../../config/database.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import type {
  Job,
  JobApplication,
  JobsListQuery,
  JobsListResponse,
  ApplyJobRequest,
} from './jobs.types.js';

interface DbJob {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DbJobApplication {
  id: string;
  job_id: string;
  name: string;
  email: string;
  phone: string | null;
  resume_url: string | null;
  created_at: Date;
}

export class JobsService {
  private mapDbJobToJob(dbJob: DbJob): Job {
    return {
      id: dbJob.id,
      title: dbJob.title,
      description: dbJob.description,
      requirements: dbJob.requirements,
      location: dbJob.location,
      isActive: dbJob.is_active,
      createdAt: dbJob.created_at,
      updatedAt: dbJob.updated_at,
    };
  }

  private mapDbApplicationToApplication(dbApp: DbJobApplication): JobApplication {
    return {
      id: dbApp.id,
      jobId: dbApp.job_id,
      name: dbApp.name,
      email: dbApp.email,
      phone: dbApp.phone,
      resumeUrl: dbApp.resume_url,
      createdAt: dbApp.created_at,
    };
  }

  async getJobs(query: JobsListQuery): Promise<JobsListResponse> {
    const { limit = 20, offset = 0 } = query;

    const baseQuery = db<DbJob>('jobs').where('is_active', true);

    const countResult = await baseQuery.clone().count('id as count').first() as { count: string } | undefined;
    const total = parseInt(countResult?.count || '0', 10);

    const jobs = await baseQuery
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      jobs: jobs.map((j) => this.mapDbJobToJob(j)),
      total,
      limit,
      offset,
    };
  }

  async getJobById(jobId: string): Promise<Job> {
    const job = await db<DbJob>('jobs')
      .where('id', jobId)
      .where('is_active', true)
      .first();

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    return this.mapDbJobToJob(job);
  }

  async applyForJob(jobId: string, request: ApplyJobRequest): Promise<JobApplication> {
    // Verify job exists and is active
    const job = await db<DbJob>('jobs')
      .where('id', jobId)
      .where('is_active', true)
      .first();

    if (!job) {
      throw new NotFoundError('Job not found or no longer accepting applications');
    }

    const [application] = await db('job_applications')
      .insert({
        job_id: jobId,
        name: request.name,
        email: request.email,
        phone: request.phone || null,
        resume_url: request.resumeUrl || null,
      })
      .returning('*') as DbJobApplication[];

    return this.mapDbApplicationToApplication(application);
  }
}

export const jobsService = new JobsService();
