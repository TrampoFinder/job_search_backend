/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ReportManagementModule } from '@reportManagementModule/report-management.module';
import { CandidatesReportRepository } from '@reportManagementModule/persistence/repository/candidates-report.repository';
import { CandidateStatistic } from '@reportManagementModule/core/model/candidates-statistic.model';
import { userFactory } from '@testInfra/factory/user.test-factory';
import { jobFactory } from '@testInfra/factory/job.test-factory';
import { jobApplicationAppliedFactory } from '@testInfra/factory/job-application.test-factory';
import { testDbClient } from '@testInfra/knex.database';
import { Tables } from '@testInfra/enum/tables.enum';
import { signInFactory } from '@testInfra/factory/sign-in.test-factory';
describe('ReportManagement (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let prisma: PrismaClient;
  let candidatesReportRepository: CandidatesReportRepository;
  let user: any;
  let job: any;
  let jobApplication: any;
  let token: any;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ReportManagementModule],
    }).compile();
    app = module.createNestApplication();
    prisma = new PrismaClient();
    await prisma.$connect();
    await app.init();
    candidatesReportRepository = module.get<CandidatesReportRepository>(
      CandidatesReportRepository,
    );
  });
  beforeEach(async () => {
    user = userFactory.build({
      role: 'ADMIN',
    });
    job = jobFactory.buildList(2);
    jobApplication = jobApplicationAppliedFactory.build();
    await testDbClient(Tables.identity_tb_users).insert(user);
    await testDbClient(Tables.job_management_tb_jobs).insert(job);
    await testDbClient(
      Tables.job_management_tb_job_application_processes,
    ).insert([
      jobApplicationAppliedFactory.build({
        userId: user.id,
        jobId: job[0].id,
      }),
      jobApplicationAppliedFactory.build({
        userId: user.id,
        jobId: job[1].id,
        status: 'IN_PROGRESS',
      }),
    ]);
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2025-02-02'));
    // await prisma.job.create({
    //   data: {
    //     id: 'test-job',
    //     title: 'Software Engineer',
    //     company: 'Test Company ',
    //     status: 'ACTIVE',
    //     location: 'São Paulo, BR',
    //     url: 'https://company.com/job123',
    //     createdAt: new Date('2025-01-01'),
    //     updatedAt: new Date('2025-01-01'),
    //     deletedAt: null,
    //   },
    // });
    // await prisma.jobApplicationProcess.create({
    //   data: {
    //     id: 'test-process1',
    //     title: 'Software Engineer - Full-stack developer role',
    //     url: 'https://company.com/job123',
    //     userId: 'test-user',
    //     jobId: 'test-job',
    //     status: 'APPLIED',
    //     company: 'Test Company',
    //     createdAt: new Date('2025-01-01'),
    //     updatedAt: new Date('2025-01-01'),
    //     deletedAt: null,
    //   },
    // });
    // await prisma.jobApplicationProcess.create({
    //   data: {
    //     id: 'test-process2',
    //     title: 'Software Engineer',
    //     url: 'https://company.com/job123',
    //     userId: 'test-user',
    //     jobId: 'test-job',
    //     company: 'Test Company',
    //     status: 'IN_PROGRESS',
    //     createdAt: new Date('2025-01-01'),
    //     updatedAt: new Date('2025-01-01'),
    //     deletedAt: null,
    //   },
    // });
    // await prisma.jobApplicationProcess.create({
    //   data: {
    //     id: 'test-process3',
    //     title: 'Software Engineer',
    //     url: 'https://company.com/job123',
    //     userId: 'test-user',
    //     jobId: 'test-job',
    //     company: 'Test Company',
    //     status: 'REJECTED',
    //     createdAt: new Date('2025-01-01'),
    //     updatedAt: new Date('2025-01-01'),
    //     deletedAt: null,
    //   },
    // });
    // await prisma.jobApplicationProcess.create({
    //   data: {
    //     id: 'test-process4',
    //     title: 'Software Engineer',
    //     url: 'https://company.com/job123',
    //     userId: 'test-user1',
    //     jobId: 'test-job',
    //     status: 'REJECTED',
    //     company: 'Test Company',
    //     createdAt: new Date('2025-01-01'),
    //     updatedAt: new Date('2025-01-01'),
    //     deletedAt: null,
    //   },
    // });
  });

  afterEach(async () => {
    await testDbClient(
      Tables.job_management_tb_job_application_processes,
    ).del();
    await testDbClient(Tables.job_management_tb_jobs).del();
    await testDbClient(Tables.identity_tb_users).del();
    await candidatesReportRepository.clear();
  });
  afterAll(async () => {
    await candidatesReportRepository.clear();
    await testDbClient.destroy();
    await module.close();
  });
  describe('ReportController (GET)', () => {
    it('returns a list of candidates with average applications view', async () => {
      token = await signInFactory(user.email, user.password);
      const response = await request(app.getHttpServer())
        .get('/candidates-report/view')
        .set('Authorization', `Bearer ${token.accessToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBe(1);
      expect(response.body.totalPages).toBe(1);
      expect(response.body.previousPage).toBe(null);
      expect(response.body.nextPage).toBe(null);
      expect(
        response.body.data.map((item: CandidateStatistic) => ({
          userId: item.userId,
          fullName: item.fullName,
          notProcessing: item.notProcessing,
          applied: item.applied,
          inProgress: item.inProgress,
          approved: item.approved,
          rejected: item.rejected,
          closed: item.closed,
        })),
      ).toEqual([
        {
          userId: user.id,
          fullName: user.firstName + ' ' + user.lastName,
          notProcessing: '0.00',
          applied: '50.00',
          inProgress: '50.00',
          approved: '0.00',
          rejected: '0.00',
          closed: '0.00',
        },
      ]);
    });
    it('returns a file of candidates with average applications', async () => {
      token = await signInFactory(user.email, user.password);
      const unlinkSpy = jest
        .spyOn(fs, 'unlinkSync')
        .mockImplementation(() => {});
      const response = await request(app.getHttpServer())
        .get('/candidates-report/download')
        .set('Authorization', `Bearer ${token.accessToken}`)
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
    it('returns a list of candidates with average applications', async () => {
      token = await signInFactory(user.email, user.password);
      const response = await request(app.getHttpServer())
        .get('/candidates-report')
        .set('Authorization', `Bearer ${token.accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data[0]).toMatchObject({
        userId: user.id,
        fullName: user.firstName + ' ' + user.lastName,
        totalApplications: 2,
        activeProcessCount: 2,
        statusCount: {
          IN_PROGRESS: 1,
          APPROVED: 0,
          APPLIED: 1,
          REJECTED: 0,
          CLOSED: 0,
          NOT_PROCESSING: 0,
        },
      });
    });
    it('returns a candidate with average applications by id', async () => {
      const userNotAdmin = userFactory.build({
        role: 'USER',
      });
      await testDbClient(Tables.identity_tb_users).insert(userNotAdmin);
      await testDbClient(
        Tables.job_management_tb_job_application_processes,
      ).insert(
        jobApplicationAppliedFactory.build({
          userId: userNotAdmin.id,
          jobId: job[0].id,
          status: 'REJECTED',
        }),
      );
      token = await signInFactory(userNotAdmin.email, userNotAdmin.password);
      const response = await request(app.getHttpServer())
        .get(`/candidates-report/${userNotAdmin.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect(200);
      expect(response.body).toMatchObject({
        notProcessing: '0.00',
        applied: '0.00',
        inProgress: '0.00',
        approved: '0.00',
        rejected: '100.00',
        closed: '0.00',
      });
    });
  });
});
