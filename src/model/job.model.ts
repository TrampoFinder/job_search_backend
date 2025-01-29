export enum JobStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export default class JobModel {
  readonly id: string;
  title: string;
  description: string;
  link: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(data: JobModel) {
    Object.assign(this, data);
  }
}
