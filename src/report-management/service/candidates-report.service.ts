import { Injectable } from '@nestjs/common';
import { CandidatesReportNotFoundException } from '../exception/candidates-report-not-found.exception';
import { CandidateStatistic } from '../model/candidates-statistic.model';
import { CandidatesReportRepository } from '../repository/candidates-report.repository';

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
