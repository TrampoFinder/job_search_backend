import { PrismaService } from '@sharedModule/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { DefaultPrismaRepository } from '@sharedModule/prisma/default.prisma.repository';
import JobApplicationModel from '@jobManagementModule/core/model/job-application.model';

type QueryableFields = Prisma.$UserPayload['scalars'];

@Injectable()
export class JobApplicationRepository extends DefaultPrismaRepository {
  private readonly model: PrismaService['jobApplicationProcess'];
  constructor(prismaService: PrismaService) {
    super();
    this.model = prismaService.jobApplicationProcess;
  }
  getAllApplicationJobs = async (
    userId: string,
  ): Promise<JobApplicationModel[]> => {
    try {
      return this.model.findMany({ where: { userId } });
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  save = async (data: JobApplicationModel): Promise<JobApplicationModel> => {
    try {
      return await this.model.create({ data });
    } catch (error) {
      this.handleAndThrowError(error);
    }
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
}
