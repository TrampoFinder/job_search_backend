import FavoriteJobModel from '@jobManagementModule/core/model/favorite-job.model';
import JobModel from '@jobManagementModule/core/model/job.model';
import { Injectable } from '@nestjs/common';
import { DefaultPrismaRepository } from '@sharedModule/prisma/default.prisma.repository';
import { PrismaService } from '@sharedModule/prisma/prisma.service';
@Injectable()
export default class FavoriteJobRepository extends DefaultPrismaRepository {
  private readonly model: PrismaService['favoriteJob'];
  constructor(prismaService: PrismaService) {
    super();
    this.model = prismaService.favoriteJob;
  }
  getFavoriteJobsByUserId = async (
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<
    | {
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
      }
    | undefined
  > => {
    try {
      const total = await this.model.count({ where: { userId } });
      const favoriteJobs = await this.model.findMany({
        where: {
          userId,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          job: true,
        },
      });
      if (!favoriteJobs) {
        return;
      }
      return {
        data: favoriteJobs,
        total,
      };
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  findById = async (
    jobId: string,
    userId: string,
  ): Promise<FavoriteJobModel | undefined> => {
    try {
      const favoriteJob = await this.model.findFirst({
        where: {
          jobId,
          userId,
        },
      });
      if (!favoriteJob) {
        return;
      }
      return favoriteJob;
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };
  save = async (data: FavoriteJobModel): Promise<FavoriteJobModel> => {
    try {
      return await this.model.create({ data });
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };
  deleteByUserIdAndJobId = async (
    jobId: string,
    userId: string,
  ): Promise<void> => {
    try {
      await this.model.delete({ where: { userId_jobId: { userId, jobId } } });
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  clear = async (): Promise<{ count: number }> => {
    try {
      return await this.model.deleteMany();
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };
}
