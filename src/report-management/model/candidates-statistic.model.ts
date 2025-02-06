export class CandidateStatistic {
  userId: string;
  fullName: string;
  notProcessing: number;
  applied: number;
  inProgress: number;
  approved: number;
  rejected: number;
  closed: number;
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
