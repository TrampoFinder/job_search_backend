import JobModel from '@src/job-management/model/job.model';
import { PrismaService } from '@src/shared/module/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { DefaultPrismaRepository } from '@src/shared/module/prisma/default.prisma.repository';

@Injectable()
export class JobRepository extends DefaultPrismaRepository {
  private readonly model: PrismaService['job'];
  constructor(prismaService: PrismaService) {
    super();
    this.model = prismaService.job;
  }
  getAllJobs = async (): Promise<JobModel[]> => {
    try {
      return this.model.findMany();
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  save = async (data: JobModel): Promise<JobModel> => {
    try {
      return await this.model.create({ data });
    } catch (error) {
      this.handleAndThrowError(error);
    }
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
}
