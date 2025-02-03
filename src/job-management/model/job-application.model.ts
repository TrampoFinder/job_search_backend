import { randomUUID } from 'crypto';

export const JobApplicationProcessType: {
  [x: string]:
    | 'NOT_PROCESSING'
    | 'APPLIED'
    | 'IN_PROGRESS'
    | 'APPROVED'
    | 'REJECTED'
    | 'CLOSED';
} = {
  NOT_PROCESSING: 'NOT_PROCESSING',
  APPLIED: 'APPLIED',
  IN_PROGRESS: 'IN_PROGRESS',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED',
};

export type JobApplicationProcessType =
  (typeof JobApplicationProcessType)[keyof typeof JobApplicationProcessType];

export default class JobApplicationModel {
  id: string;
  title: string;
  url: string;
  userId: string;
  jobId: string;
  status: JobApplicationProcessType | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(data: JobApplicationModel) {
    Object.assign(this, data);
  }

  static create(
    data: Omit<
      JobApplicationModel,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
    >,
    id = randomUUID(),
  ): JobApplicationModel {
    return new JobApplicationModel({
      id,
      title: data.title,
      url: data.url,
      userId: data.userId,
      jobId: data.jobId,
      status: data.status ?? null,
      note: data.note ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  }
}
