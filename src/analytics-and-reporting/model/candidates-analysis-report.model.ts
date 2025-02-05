export class CandidatesAnalysisReport {
  userId: string;
  fullName: string;
  notProcessing: number;
  applied: number;
  inProgress: number;
  approved: number;
  rejected: number;
  closed: number;
  // createdAt: Date;
  constructor(data: CandidatesAnalysisReport) {
    Object.assign(this, data);
  }
  static create(
    data: Omit<CandidatesAnalysisReport, 'createdAt'>,
  ): CandidatesAnalysisReport {
    return new CandidatesAnalysisReport({
      ...data,
      // createdAt: new Date(),
    });
  }
}
