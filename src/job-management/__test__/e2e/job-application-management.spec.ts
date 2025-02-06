import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobManagementModule } from '@src/job-management/job-management.module';
import { JobApplicationRepository } from '@src/job-management/repository/job-application.repository';
import { JobRepository } from '@src/job-management/repository/job.repository';
import { JobManagementService } from '@src/job-management/service/job-management.service';

import request from 'supertest';
import { IdentityAuthenticateApi } from '@src/shared/module/integration/interface/identity-integration.interface';
import { JobApplicationManagementService } from '@src/job-management/service/job-application-management.service';

describe('JobApplicationController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let jobManagementService: JobManagementService;
  let jobApplicationManagementService: JobApplicationManagementService;
  let jobApplicationRepository: JobApplicationRepository;
  let jobRepository: JobRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [JobManagementModule],
    })
      .overrideProvider(IdentityAuthenticateApi)
      .useValue({
        authenticate: () => {
          return { id: 'mocked-user-id', role: 'USER' };
        },
        hasPermission: () => {
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    await app.init();

    jobApplicationManagementService =
      module.get<JobApplicationManagementService>(
        JobApplicationManagementService,
      );
    jobManagementService =
      module.get<JobManagementService>(JobManagementService);
    jobApplicationRepository = module.get<JobApplicationRepository>(
      JobApplicationRepository,
    );
    jobRepository = module.get<JobRepository>(JobRepository);
  });

  beforeEach(async () => {
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2025-08-08'));
  });

  afterEach(async () => {
    await jobApplicationRepository.clear();
    await jobRepository.clear();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('/job-application (POST)', () => {
    it('should apply a job successfully', async () => {
      const jobInput = {
        title: 'Test Job',
        description: 'Job in R. Rego Freitas',
        url: 'https://republicarr.jobs.com.br/',
      };
      const jobOutput = await jobManagementService.createJob(jobInput);
      const jobApplicationInput = {
        title: jobInput.title,
        url: jobInput.url,
        status: 'APPLIED',
      };
      const response = await request(app.getHttpServer())
        .post(`/job-application/apply/${jobOutput.id}`)
        .send(jobApplicationInput)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        title: jobApplicationInput.title,
        url: jobApplicationInput.url,
        jobId: jobOutput.id,
      });
    });
    it('should not allow invalid jobId', async () => {
      const jobInput = {
        title: 'Test Job',
        description: 'Job in R. Rego Freitas',
        url: 'https://republicarr.jobs.com.br/',
      };
      await jobManagementService.createJob(jobInput);
      const jobApplicationInput = {
        title: jobInput.title,
        url: jobInput.url,
        userId: 'test',
        status: 'APPLIED',
      };

      await request(app.getHttpServer())
        .post(`/job-application/apply/${'jobOutput'}`)
        .send(jobApplicationInput)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: 'Job not found',
          error: 'Not Found',
          statusCode: 404,
        });
    });
  });
  describe('/job-application (GET)', () => {
    it('should retrieve applied jobs list', async () => {
      const jobInput = {
        title: 'Test Job',
        description: 'Job in R. Rego Freitas',
        url: 'https://republicarr.jobs.com.br/',
      };
      const jobOutput = await jobManagementService.createJob(jobInput);
      const jobApplicationOutput =
        await jobApplicationManagementService.applyForJob(
          jobOutput.id,
          'mocked-user-id',
          {
            title: jobInput.title,
            url: jobInput.url,
            status: 'APPLIED',
            note: null,
          },
        );
      const response = await request(app.getHttpServer())
        .get('/job-application/mocked-user-id/history')
        .expect(HttpStatus.OK);
      expect(response.body[0]).toMatchObject({
        title: jobApplicationOutput.title,
        url: jobApplicationOutput.url,
        jobId: jobOutput.id,
        userId: 'mocked-user-id',
        status: jobApplicationOutput.status,
        note: jobApplicationOutput.note,
      });
    });
  });
});
