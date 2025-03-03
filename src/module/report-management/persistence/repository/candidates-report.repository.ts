import { Injectable } from '@nestjs/common';
import { PrismaService } from '@sharedModule/prisma/prisma.service';
import { DefaultPrismaRepository } from '@sharedModule/prisma/default.prisma.repository';
import { CandidateStatistic } from '@reportManagementModule/core/model/candidates-statistic.model';

@Injectable()
export class CandidatesReportRepository extends DefaultPrismaRepository {
  private readonly model: PrismaService['userJobApplicationAvg'];
  constructor(private readonly prismaService: PrismaService) {
    super();
    this.model = prismaService.userJobApplicationAvg;
  }
  getAverageApplications = async (
    page: number = 1,
    pageSize: number = 10,
  ): Promise<
    | {
        data: CandidateStatistic[];
        total: number;
      }
    | undefined
  > => {
    try {
      const average = await this.model.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { fullName: 'asc' },
      });
      if (!average) {
        return;
      }
      const candidateStatistic = average.map((item) => ({
        userId: item.userId,
        fullName: item.fullName!,
        notProcessing: (item.notProcessing.toNumber() * 100).toFixed(2),
        applied: (item.applied.toNumber() * 100).toFixed(2),
        inProgress: (item.inProgress.toNumber() * 100).toFixed(2),
        approved: (item.approved.toNumber() * 100).toFixed(2),
        rejected: (item.rejected.toNumber() * 100).toFixed(2),
        closed: (item.closed.toNumber() * 100).toFixed(2),
      }));
      const total = await this.model.count();
      return { data: candidateStatistic, total };
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };
  getAverageReport = async (): Promise<CandidateStatistic[] | undefined> => {
    try {
      const average = await this.model.findMany();
      if (!average) {
        return;
      }
      return average.map((item) => ({
        userId: item.userId,
        fullName: item.fullName!,
        notProcessing: (item.notProcessing.toNumber() * 100).toFixed(2),
        applied: (item.applied.toNumber() * 100).toFixed(2),
        inProgress: (item.inProgress.toNumber() * 100).toFixed(2),
        approved: (item.approved.toNumber() * 100).toFixed(2),
        rejected: (item.rejected.toNumber() * 100).toFixed(2),
        closed: (item.closed.toNumber() * 100).toFixed(2),
      }));
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };
  clear = async (): Promise<{ count: number }> => {
    try {
      await this.prismaService.$queryRaw`TRUNCATE TABLE tb_users CASCADE;`;
      await this.prismaService.$queryRaw`TRUNCATE TABLE tb_jobs CASCADE;`;
      await this.prismaService
        .$queryRaw`TRUNCATE TABLE tb_job_application_processes CASCADE;`;
      return { count: 0 };
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };
}
