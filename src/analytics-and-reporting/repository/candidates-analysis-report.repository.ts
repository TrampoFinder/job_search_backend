import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/module/prisma/prisma.service';
import { CandidatesAnalysisReport } from '../model/candidates-analysis-report.model';

@Injectable()
export class CandidatesAnalysisReportRepository {
  private readonly model: PrismaService['userJobApplicationAvg'];
  constructor(prismaService: PrismaService) {
    this.model = prismaService.userJobApplicationAvg;
  }
  getAverageApplications = async (): Promise<
    CandidatesAnalysisReport[] | undefined
  > => {
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
  };
}
