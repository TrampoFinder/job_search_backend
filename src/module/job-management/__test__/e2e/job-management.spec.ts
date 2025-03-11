import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobManagementModule } from '@jobManagementModule/job-management.module';
import { JobRepository } from '@jobManagementModule/persistence/repository/job.repository';
import request from 'supertest';
import { JobManagementService } from '../../core/service/job-management.service';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import JobModel from '@jobManagementModule/core/model/job.model';
import path from 'path';
import fs from 'fs';

describe('JobController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let jobRepository: JobRepository;
  let jobManagementService: JobManagementService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [JobManagementModule],
    })
      .overrideProvider(IdentityAuthenticateApi)
      .useValue({
        authenticate: () => {
          return { id: '647edd99-34b9-436e-9398-bde6c93cec4d', role: 'ADMIN' };
        },
        hasAdminPermission: () => {
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    await app.init();

    jobRepository = module.get<JobRepository>(JobRepository);
    jobManagementService =
      module.get<JobManagementService>(JobManagementService);
  });

  beforeEach(async () => {
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2025-08-08'));
  });

  afterEach(async () => {
    await jobRepository.clear();
  });

  afterAll(async () => {
    await module.close();
    fs.rmSync('./uploads', { recursive: true, force: true });
  });

  describe('/job-management (POST)', () => {
    it('should create a job successfully', async () => {
      const input = {
        title: 'Test Job',
        company: 'Job in R. Rego Freitas',
        location: 'São Paulo, BR',
        url: 'https://republicarr.jobs.com.br/',
      };

      await request(app.getHttpServer())
        .post('/job-management/register')
        .send(input)
        .expect(HttpStatus.CREATED)
        .expect((response) => {
          expect(response.body).toMatchObject({
            title: input.title,
            company: input.company,
            location: input.location,
            url: input.url,
          });
        });
    });
    it('should create a job successfully with excel', async () => {
      const response = await request(app.getHttpServer())
        .post('/job-management/uploadJobs')
        .attach(
          'file',
          path.resolve(
            __dirname,
            '../../../../../test/fixtures/use_case_plan_50.xlsx',
          ),
        )
        .expect(HttpStatus.CREATED);
      expect(response.body).toHaveLength(49);
    });
    it('should throw error when the job URL is invalid', async () => {
      const input = {
        title: 'Test Job',
        company: 'Job in R. Rego Freitas',
        location: 'São Paulo, BR',
        url: 'republicarr.br',
      };

      await request(app.getHttpServer())
        .post('/job-management/register')
        .send(input)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((response) => {
          expect(response.body).toMatchObject({
            message: ['URL is not a valid.'],
            error: 'Bad Request',
            statusCode: 400,
          });
        });
    });
  });
  it('should reject invalid parameters', async () => {
    const input = {
      title: 1234,
      company: 95156,
      location: 'São Paulo, BR',
      url: 'republicarr.br',
    };
    await request(app.getHttpServer())
      .post('/job-management/register')
      .send(input)
      .expect(HttpStatus.BAD_REQUEST)
      .expect({
        message: [
          'Must be a string',
          'Must be a string',
          'URL is not a valid.',
        ],
        error: 'Bad Request',
        statusCode: 400,
      });
  });

  it('retrieve job by company', async () => {
    const jobInput = {
      title: 'Test Job',
      company: 'Job in R. Rego Freitas',
      url: 'https://republicarr.jobs.com.br/',
      location: 'São Paulo, BR',
    };
    await jobManagementService.createJob(jobInput);
    await request(app.getHttpServer())
      .get(`/job-management/companies/`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toEqual({
          companyCount: 1,
        });
      });
  });
  it('retrieve jobs', async () => {
    const data: JobModel[] = [];
    let count = 0;
    for (let i = 0; i < 15; i++) {
      const jobInput = {
        title: `Test Job${count}`,
        company: 'Job in R. Rego Freitas',
        url: 'https://republicarr.jobs.com.br/',
        location: 'São Paulo, BR',
      };
      count++;
      data.push(await jobManagementService.createJob(jobInput));
    }
    await request(app.getHttpServer())
      .get(`/job-management`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.total).toBe(15);
        expect(res.body.totalPages).toBe(2);
        expect(res.body.previousPage).toBe(null);
        expect(res.body.nextPage).toBe(2);
        expect(
          res.body.data.map((item: JobModel) => ({
            title: item.title,
            company: item.company,
            url: item.url,
            location: item.location,
          })),
        ).toEqual(
          data
            .sort()
            .slice(0, 10)
            .map((item) => ({
              title: item.title,
              company: item.company,
              url: item.url,
              location: item.location,
            })),
        );
      });
  });
});
