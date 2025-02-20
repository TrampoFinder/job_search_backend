export class CandidateStatistic {
  userId: string;
  fullName: string;
  notProcessing: string;
  applied: string;
  inProgress: string;
  approved: string;
  rejected: string;
  closed: string;
  // createdAt: Date;
  constructor(data: CandidateStatistic) {
    Object.assign(this, data);
  }
  static create(
    data: Omit<CandidateStatistic, 'createdAt'>,
  ): CandidateStatistic {
    return new CandidateStatistic({
      ...data,
      // createdAt: new Date(),
    });
  }
}
