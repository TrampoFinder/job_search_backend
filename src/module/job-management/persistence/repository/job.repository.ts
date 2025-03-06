import { PrismaService } from '@sharedModule/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DefaultPrismaRepository } from '@sharedModule/prisma/default.prisma.repository';
import JobModel from '@jobManagementModule/core/model/job.model';
import { Prisma } from '@prisma/client';
type QueryableFields = Prisma.$UserPayload['scalars'];
@Injectable()
export class JobRepository extends DefaultPrismaRepository {
  private readonly model: PrismaService['job'];
  constructor(prismaService: PrismaService) {
    super();
    this.model = prismaService.job;
  }
  findAll = async (
    fields: Partial<QueryableFields>,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<{ jobs: JobModel[]; total: number }> => {
    try {
      const where = fields ? { ...fields } : {};
      const total = await this.model.count({ where });
      const jobs = await this.model.findMany({
        where,
        skip: pageSize * (page - 1),
        take: pageSize,
        orderBy: { createdAt: 'asc' },
      });
      return { jobs, total };
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

  findByCompanyCount = async (): Promise<number> => {
    try {
      const companyJobs = await this.model.findMany({
        distinct: ['company'],
        select: { company: true },
      });

      if (!companyJobs) {
        return 0;
      }
      return companyJobs.length;
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
