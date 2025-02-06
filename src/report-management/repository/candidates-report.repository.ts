import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/module/prisma/prisma.service';
import { DefaultPrismaRepository } from '@src/shared/module/prisma/default.prisma.repository';
import { CandidateStatistic } from '../model/candidates-statistic.model';

@Injectable()
export class CandidatesReportRepository extends DefaultPrismaRepository {
  private readonly model: PrismaService['userJobApplicationAvg'];
  constructor(private readonly prismaService: PrismaService) {
    super();
    this.model = prismaService.userJobApplicationAvg;
  }
  getAverageApplications = async (): Promise<
    CandidateStatistic[] | undefined
  > => {
    try {
      const average = await this.model.findMany();
      if (!average) {
        return;
      }
      return average.map((item) => ({
        userId: item.userId,
        fullName: item.fullName!,
        notProcessing: item.notProcessing.toNumber(),
        applied: item.applied.toNumber(),
        inProgress: item.inProgress.toNumber(),
        approved: item.approved.toNumber(),
        rejected: item.rejected.toNumber(),
        closed: item.closed.toNumber(),
      }));
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };
  clear = async (): Promise<{ count: number }> => {
    try {
      await this.prismaService.$queryRaw`TRUNCATE TABLE tb_users;`;
      await this.prismaService.$queryRaw`TRUNCATE TABLE tb_jobs;`;
      await this.prismaService
        .$queryRaw`TRUNCATE TABLE tb_job_application_processes;`;
      return { count: 0 };
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };
}
