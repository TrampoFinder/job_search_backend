import { Injectable } from '@nestjs/common';
import { CandidatesReportRepository } from '@reportManagementModule/persistence/repository/candidates-report.repository';
import { CandidateStatistic } from '@reportManagementModule/core/model/candidates-statistic.model';
import { NotFoundException } from '@sharedModule/core/exception/not-found.exception';

@Injectable()
export class CandidatesReportService {
  constructor(private candidatesReportRepository: CandidatesReportRepository) {}
  getReportPaginate = async (
    page: number,
    pageSize: number,
  ): Promise<{
    data: CandidateStatistic[];
    total: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  }> => {
    const candidateReport =
      await this.candidatesReportRepository.getAverageApplications(
        page,
        pageSize,
      );
    if (!candidateReport) {
      throw new NotFoundException('No candidates  report found!');
    }
    const totalPages = Math.ceil(candidateReport.total / pageSize);
    const previousPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    return {
      data: candidateReport.data,
      total: candidateReport.total,
      totalPages,
      previousPage,
      nextPage,
    };
  };
  getReport = async (): Promise<CandidateStatistic[]> => {
    const candidateReport =
      await this.candidatesReportRepository.getAverageReport();
    if (!candidateReport) {
      throw new NotFoundException('No candidates  report found!');
    }
    return candidateReport;
  };
  getReportByUserId = async (userId: string): Promise<CandidateStatistic> => {
    const candidateReport =
      await this.candidatesReportRepository.getAverageReportByUserId(userId);

    if (!candidateReport) {
      throw new NotFoundException('No candidates  report found!');
    }
    return {
      userId: candidateReport.userId,
      fullName: candidateReport.fullName,
      notProcessing: candidateReport.notProcessing,
      applied: candidateReport.applied,
      inProgress: candidateReport.inProgress,
      approved: candidateReport.approved,
      rejected: candidateReport.rejected,
      closed: candidateReport.closed,
    };
  };
}
