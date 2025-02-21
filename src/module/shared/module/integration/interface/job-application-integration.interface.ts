export interface JobApplicationApi {
  getJobApplications(
    page?: number,
    pageSize?: number,
  ): Promise<
    {
      userId: string;
      fullName: string;
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
    }[]
  >;
}

export const JobApplicationApi = Symbol('JobApplicationApi');
