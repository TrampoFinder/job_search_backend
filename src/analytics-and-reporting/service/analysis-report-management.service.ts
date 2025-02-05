import { Injectable } from '@nestjs/common';
import { CandidatesAnalysisReportRepository } from '../repository/candidates-analysis-report.repository';
import { CandidatesAnalysisReportNotFoundException } from '../exception/candidates-analysis-report-not-found.exception';

@Injectable()
export class AnalysisReportManagementService {
  constructor(
    private candidatesAnalysisReportRepository: CandidatesAnalysisReportRepository,
  ) {}
  getAverageApplications = async () => {
    const candidateAnalysisReport =
      await this.candidatesAnalysisReportRepository.getAverageApplications();
    if (!candidateAnalysisReport) {
      throw new CandidatesAnalysisReportNotFoundException(
        'No candidates analysis report found!',
      );
    }
  };
}
