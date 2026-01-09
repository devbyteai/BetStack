import { baseApi } from '@/store/api/baseApi';
import type {
  Job,
  JobApplication,
  JobsListResponse,
  JobsListQuery,
  ApplyJobRequest,
} from '../types';

export const jobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all active jobs
    getJobs: builder.query<JobsListResponse, JobsListQuery | void>({
      query: (params) => ({
        url: '/jobs',
        params: params || {},
      }),
      providesTags: ['Jobs'],
    }),

    // Get single job details
    getJobById: builder.query<Job, string>({
      query: (id) => `/jobs/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Jobs', id }],
    }),

    // Apply for a job
    applyForJob: builder.mutation<
      { application: JobApplication; message: string },
      { jobId: string; data: ApplyJobRequest }
    >({
      query: ({ jobId, data }) => ({
        url: `/jobs/${jobId}/apply`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetJobByIdQuery,
  useApplyForJobMutation,
} = jobsApi;
