export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  createdAt: string;
}

export interface JobsListResponse {
  jobs: Job[];
  total: number;
  limit: number;
  offset: number;
}

export interface JobsListQuery {
  limit?: number;
  offset?: number;
}

export interface ApplyJobRequest {
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
}
