import FavoriteJobRepository from '@jobManagementModule/persistence/repository/favorite-job.repository';
import { JobRepository } from '@jobManagementModule/persistence/repository/job.repository';
import { NotFoundException } from '@sharedModule/core/exception/not-found.exception';
import JobModel from '../model/job.model';
import FavoriteJobModel from '../model/favorite-job.model';
import { AlreadyExists } from '@sharedModule/core/exception/already-exists.exception';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class FavoriteJobService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly favoriteJobRepository: FavoriteJobRepository,
  ) {}
  getFavoriteJobs = async (
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{
    data: {
      id: string;
      userId: string;
      jobId: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      job: JobModel;
    }[];
    total: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  }> => {
    const getFavoriteJobs =
      await this.favoriteJobRepository.getFavoriteJobsByUserId(
        userId,
        page,
        pageSize,
      );
    if (!getFavoriteJobs) {
      throw new NotFoundException('Favorites not found!');
    }
    const totalPages = Math.ceil(getFavoriteJobs.data.length / pageSize);
    const previousPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    return {
      data: getFavoriteJobs.data,
      total: getFavoriteJobs.total,
      totalPages,
      previousPage,
      nextPage,
    };
  };
  addFavoriteJob = async (
    jobId: string,
    userId: string,
  ): Promise<FavoriteJobModel> => {
    const jobExists = await this.jobRepository.findById(jobId);
    if (!jobExists) {
      throw new NotFoundException('Job not found!');
    }
    const favoriteJobExists = await this.favoriteJobRepository.findById(
      jobId,
      userId,
    );
    if (favoriteJobExists) {
      throw new AlreadyExists('Favorite job already exists!');
    }

    return await this.favoriteJobRepository.save(
      FavoriteJobModel.create({ userId, jobId }),
    );
  };

  removeFavoriteJob = async (jobId: string, userId: string): Promise<void> => {
    const favoriteJob = await this.favoriteJobRepository.findById(
      jobId,
      userId,
    );
    if (!favoriteJob) {
      throw new NotFoundException('Favorite job not found!');
    }
    await this.favoriteJobRepository.deleteByUserIdAndJobId(jobId, userId);
  };
}
