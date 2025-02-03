import JobModel from '@src/job-management/model/job.model';
import { PrismaService } from '@src/shared/module/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobRepository {
  private readonly model: PrismaService['job'];
  constructor(prismaService: PrismaService) {
    this.model = prismaService.job;
  }
  getAllJobs = async (): Promise<JobModel[]> => {
    return this.model.findMany();
  };

  save = async (data: JobModel): Promise<JobModel> => {
    return await this.model.create({ data });
  };

  findById = async (id: string): Promise<JobModel | undefined> => {
    try {
      const job = await this.model.findFirst({ where: { id } });
      if (!job) {
        return;
      }
      return job;
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

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'An unexpected error occurred.';
  }
  protected handleAndThrowError(error: unknown): never {
    const errorMessage = this.extractErrorMessage(error);
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new Error(error.message);
    }

    throw new Error(errorMessage);
  }
}
