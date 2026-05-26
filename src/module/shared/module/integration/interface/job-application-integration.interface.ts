export interface JobApplicationApi {
  getJobApplications(
    page: number,
    pageSize: number,
  ): Promise<{
    data: {
      userId: string;
      totalApplications: number;
      activeProcessCount: number;
      statusCount: {
        IN_PROGRESS: number;
        APPROVED: number;
        APPLIED: number;
        REJECTED: number;
        CLOSED: number;
        NOT_PROCESSING: number;
      };
    }[];
    total: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  }>;
}

export const JobApplicationApi = Symbol('JobApplicationApi');
