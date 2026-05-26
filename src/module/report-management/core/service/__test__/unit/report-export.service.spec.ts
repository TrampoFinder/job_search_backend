import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import { ReportExportService } from '@reportManagementModule/core/service/report-export.service';
import { CandidatesReportService } from '@reportManagementModule/core/service/candidates-report.service';
import { InvalidFileReportGeneratorException } from '@reportManagementModule/core/exception/invalid-file-report-generator .exceptions';

describe('ReportExportService', () => {
  let reportExportService: ReportExportService;
  let candidatesReportService: CandidatesReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportExportService,
        {
          provide: CandidatesReportService,
          useValue: {
            getReport: jest.fn(),
          },
        },
      ],
    }).compile();

    reportExportService = module.get<ReportExportService>(ReportExportService);
    candidatesReportService = module.get<CandidatesReportService>(
      CandidatesReportService,
    );
  });

  it('exports candidates report to a file', async () => {
    jest.spyOn(candidatesReportService, 'getReport').mockResolvedValue([
      {
        userId: 'user-1',
        fullName: 'User Test',
        notProcessing: '0.00',
        applied: '50.00',
        inProgress: '50.00',
        approved: '0.00',
        rejected: '0.00',
        closed: '0.00',
      },
    ]);

    const { filePath, fileName } =
      await reportExportService.exportCandidatesReport();

    expect(fileName).toBe('candidates-report.xlsx');
    expect(fs.existsSync(filePath)).toBe(true);

    fs.unlinkSync(filePath);
  });

  it('throws when report generation fails', async () => {
    jest
      .spyOn(candidatesReportService, 'getReport')
      .mockRejectedValue(new Error('boom'));

    await expect(
      reportExportService.exportCandidatesReport(),
    ).rejects.toBeInstanceOf(InvalidFileReportGeneratorException);
  });
});
