import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobManagementModule } from '@jobManagementModule/job-management.module';
import { JobApplicationRepository } from '@jobManagementModule/persistence/repository/job-application.repository';
import { JobRepository } from '@jobManagementModule/persistence/repository/job.repository';
import request from 'supertest';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { JobApplicationManagementService } from '@jobManagementModule/core/service/job-application-management.service';
import { JobManagementService } from '@jobManagementModule/core/service/job-management.service';
import { PrismaService } from '@src/module/shared/module/prisma/prisma.service';

describe('JobApplicationController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let jobManagementService: JobManagementService;
  let jobApplicationManagementService: JobApplicationManagementService;
  let jobApplicationRepository: JobApplicationRepository;
  let jobRepository: JobRepository;
  let prismaService: PrismaService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [JobManagementModule],
    })
      .overrideProvider(IdentityAuthenticateApi)
      .useValue({
        authenticate: () => {
          return { id: '647edd99-34b9-436e-9398-bde6c93cec4d', role: 'USER' };
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
    prismaService = module.get<PrismaService>(PrismaService);
    await prismaService.user.create({
      data: {
        id: '647edd99-34b9-436e-9398-bde6c93cec4d',
        firstName: 'Test',
        lastName: 'User',
        email: 'testsss@example.com',
        password: 'test',
        salt: 'random_salt',
        isActive: true,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    });
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
    await prismaService.user.deleteMany();
    await module.close();
  });

  describe('/job-application (POST)', () => {
    it('should apply a job successfully', async () => {
      const jobInput = {
        title: 'Test Job',
        company: 'Job in R. Rego Freitas',
        url: 'https://republicarr.jobs.com.br/',
        location: 'São Paulo, BR',
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
        company: 'Job in R. Rego Freitas',
        url: 'https://republicarr.jobs.com.br/',
        location: 'São Paulo, BR',
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
  describe('JobApplication (GET)', () => {
    it('should retrieve applied jobs list', async () => {
      const jobInput = {
        title: 'Test Job',
        company: 'Job in R. Rego Freitas',
        url: 'https://republicarr.jobs.com.br/',
        location: 'São Paulo, BR',
      };
      const jobOutput = await jobManagementService.createJob(jobInput);
      const jobApplicationOutput =
        await jobApplicationManagementService.applyForJob(
          jobOutput.id,
          '647edd99-34b9-436e-9398-bde6c93cec4d',
          {
            title: jobInput.title,
            url: jobInput.url,
            status: 'APPLIED',
            note: null,
          },
        );
      const response = await request(app.getHttpServer())
        .get('/job-application/647edd99-34b9-436e-9398-bde6c93cec4d/history')
        .expect(HttpStatus.OK);
      expect(response.body[0]).toMatchObject({
        title: jobApplicationOutput.title,
        url: jobApplicationOutput.url,
        jobId: jobOutput.id,
        userId: '647edd99-34b9-436e-9398-bde6c93cec4d',
        status: jobApplicationOutput.status,
        note: jobApplicationOutput.note,
      });
    });
  });
  describe('JobApplication (PUT)', () => {
    it('should update job application status', async () => {
      const jobInput = {
        title: 'Test Job',
        company: 'Job in R. Rego Freitas',
        url: 'https://republicarr.jobs.com.br/',
        location: 'São Paulo, BR',
      };
      const jobOutput = await jobManagementService.createJob(jobInput);
      const jobApplicationOutput =
        await jobApplicationManagementService.applyForJob(
          jobOutput.id,
          '647edd99-34b9-436e-9398-bde6c93cec4d',
          {
            title: jobInput.title,
            url: jobInput.url,
            status: 'APPLIED',
            note: null,
          },
        );
      const updatedApplicationStatus = {
        status: 'IN_PROGRESS',
        note: 'WAIT RESPONSE',
      };
      const response = await request(app.getHttpServer())
        .put(
          `/job-application/647edd99-34b9-436e-9398-bde6c93cec4d/${jobApplicationOutput.id}/update`,
        )
        .send(updatedApplicationStatus)
        .expect(HttpStatus.OK);
      expect(response.body.status).toBe(updatedApplicationStatus.status);
      expect(response.body.note).toBe(updatedApplicationStatus.note);
    });
    it('should update job application with invalid params', async () => {
      const jobInput = {
        title: 'Test Job',
        company: 'Job in R. Rego Freitas',
        url: 'https://republicarr.jobs.com.br/',
        location: 'São Paulo, BR',
      };
      const jobOutput = await jobManagementService.createJob(jobInput);

      await jobApplicationManagementService.applyForJob(
        jobOutput.id,
        '647edd99-34b9-436e-9398-bde6c93cec4d',
        {
          title: jobInput.title,
          url: jobInput.url,
          status: 'APPLIED',
          note: null,
        },
      );
      const updatedApplicationStatus = {
        status: 'IN_PROGRESS',
        note: 'WAIT RESPONSE',
      };
      const response = await request(app.getHttpServer())
        .put(
          `/job-application/647edd99-34b9-436e-9398-bde6c93cec4d/test/update`,
        )
        .send(updatedApplicationStatus)
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body).toMatchObject({
        message: 'Job application not found',
        error: 'Not Found',
        statusCode: 404,
      });
    });
  });
});
