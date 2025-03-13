import { randomUUID } from 'crypto';

export default class FavoriteJobModel {
  id: string;
  userId: string;
  jobId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  constructor(data: FavoriteJobModel) {
    Object.assign(this, data);
  }
  static create(
    data: Omit<
      FavoriteJobModel,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
    >,
    id = randomUUID(),
  ): FavoriteJobModel {
    return new FavoriteJobModel({
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  }
}
