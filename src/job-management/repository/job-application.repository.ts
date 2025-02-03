import { PrismaService } from '@src/shared/module/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import JobApplicationModel from '../model/job-application.model';

type QueryableFields = Prisma.$UserPayload['scalars'];

@Injectable()
export class JobApplicationRepository {
  private readonly model: PrismaService['jobApplicationProcess'];
  constructor(prismaService: PrismaService) {
    this.model = prismaService.jobApplicationProcess;
  }
  getAllApplicationJobs = async (
    userId: string,
  ): Promise<JobApplicationModel[]> => {
    return this.model.findMany({ where: { userId } });
  };

  save = async (data: JobApplicationModel): Promise<JobApplicationModel> => {
    return await this.model.create({ data });
  };

  findByOne = async (
    fields: Partial<QueryableFields>,
  ): Promise<JobApplicationModel | undefined> => {
    try {
      const jobApplicationProcess = await this.model.findFirst({
        where: fields,
      });
      if (!jobApplicationProcess) {
        return;
      }
      return jobApplicationProcess;
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
