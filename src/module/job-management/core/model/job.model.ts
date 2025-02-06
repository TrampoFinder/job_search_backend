import { randomUUID } from 'crypto';

export const JobStatusType: { [x: string]: 'ACTIVE' | 'INACTIVE' } = {
  ACTIVATE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export type JobStatusType = (typeof JobStatusType)[keyof typeof JobStatusType];

export default class JobModel {
  id: string;
  title: string;
  description: string;
  status: JobStatusType;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(data: JobModel) {
    Object.assign(this, data);
  }

  static create(
    data: Omit<
      JobModel,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'status'
    >,
    id = randomUUID(),
  ): JobModel {
    return new JobModel({
      id,
      title: data.title,
      description: data.description,
      status: 'ACTIVE',
      url: data.url,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  }
}
