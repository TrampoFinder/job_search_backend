import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobManagementModule } from '@src/job-management/job-management.module';
import { JobApplicationRepository } from '@src/job-management/repository/job-application.repository';
import { JobRepository } from '@src/job-management/repository/job.repository';
import { JobManagementService } from '@src/job-management/service/job-management.service';
import {
  AuthenticatedRequest,
  AuthGuard,
} from '@src/shared/util/guard/auth.guard';
import request from 'supertest';

describe('JobApplicationController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let jobManagementService: JobManagementService;
  let jobApplicationRepository: JobApplicationRepository;
  let jobRepository: JobRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [JobManagementModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
          request.user = {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe',
            email: 'john.doe@example.com',
            password: 'hashedpassword',
            salt: 'salt123',
            isActive: true,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    await app.init();
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
    it('apply a job', async () => {
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
  });

  it('does not allow invalid jobId', async () => {
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
