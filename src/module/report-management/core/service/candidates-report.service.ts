import { Injectable } from '@nestjs/common';
import { CandidatesReportNotFoundException } from '@reportManagementModule/core/exception/candidates-report-not-found.exception';
import { CandidatesReportRepository } from '@reportManagementModule/persistence/repository/candidates-report.repository';
import { CandidateStatistic } from '@reportManagementModule/core/model/candidates-statistic.model';

@Injectable()
export class CandidatesReportService {
  constructor(private candidatesReportRepository: CandidatesReportRepository) {}
  getReport = async (): Promise<CandidateStatistic[]> => {
    const candidateReport =
      await this.candidatesReportRepository.getAverageApplications();
    if (!candidateReport) {
      throw new CandidatesReportNotFoundException(
        'No candidates  report found!',
      );
    }
    return candidateReport;
  };
}
