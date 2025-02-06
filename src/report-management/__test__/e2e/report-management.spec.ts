/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { IdentityAuthenticateApi } from '@src/shared/module/integration/interface/identity-integration.interface';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { CandidatesReportRepository } from '@src/report-management/repository/candidates-report.repository';
import { ReportManagementModule } from '@src/report-management/report-management.module';
describe('ReportManagement (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let prisma: PrismaClient;
  let candidatesReportRepository: CandidatesReportRepository;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ReportManagementModule],
    })
      .overrideProvider(IdentityAuthenticateApi)
      .useValue({
        authenticate: () => {
          return { id: 'test-user', role: 'USER' };
        },
        hasPermission: () => {
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    prisma = new PrismaClient();
    await prisma.$connect();
    await app.init();
    candidatesReportRepository = module.get<CandidatesReportRepository>(
      CandidatesReportRepository,
    );
  });
  beforeEach(async () => {
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2025-02-02'));
    await prisma.user.create({
      data: {
        id: 'test-user',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'test',
        password: 'test',
        salt: 'random_salt',
        isActive: true,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    });
    await prisma.job.create({
      data: {
        id: 'test-job',
        title: 'Software Engineer',
        description: 'Full-stack developer role',
        status: 'ACTIVE',
        url: 'https://company.com/job123',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        deletedAt: null,
      },
    });

    await prisma.jobApplicationProcess.create({
      data: {
        id: 'test-process',
        title: 'Software Engineer - Full-stack developer role',
        url: 'https://company.com/job123',
        userId: 'test-user',
        jobId: 'test-job',
        status: 'APPLIED',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        deletedAt: null,
      },
    });
  });

  afterEach(async () => {
    await candidatesReportRepository.clear();
  });
  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });
  describe('ReportController (GET)', () => {
    it('returns a list of candidates with average applications', async () => {
      const response = await request(app.getHttpServer()).get(
        '/candidates-report',
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toMatchObject({
        userId: 'test-user',
        fullName: 'Test User',
        notProcessing: 0,
        applied: 1,
        inProgress: 0,
        approved: 0,
        rejected: 0,
        closed: 0,
      });
    });
    it('returns a file of candidates with average applications', async () => {
      const unlinkSpy = jest
        .spyOn(fs, 'unlinkSync')
        .mockImplementation(() => {});
      const response = await request(app.getHttpServer())
        .get('/candidates-report/download')
        .expect(HttpStatus.OK);
      expect(response.headers['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(response.headers['content-disposition']).toContain('attachment');

      const tempDir = os.tmpdir();
      const fileName = 'candidates-report.xlsx';
      const filePath = path.join(tempDir, fileName);
      expect(fs.existsSync(filePath)).toBeTruthy();
      unlinkSpy.mockRestore();
    });
  });
});
