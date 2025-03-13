import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobManagementModule } from '@jobManagementModule/job-management.module';
import { JobRepository } from '@jobManagementModule/persistence/repository/job.repository';
import request from 'supertest';
import JobModel from '@jobManagementModule/core/model/job.model';
import path from 'path';
import fs from 'fs';
import { userFactory } from '@testInfra/factory/user.test-factory';
import { jobFactory } from '@testInfra/factory/job.test-factory';
import { testDbClient } from '@testInfra/knex.database';
import { Tables } from '@testInfra/enum/tables.enum';
import { signInFactory } from '@testInfra/factory/sign-in.test-factory';

describe('JobController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let jobRepository: JobRepository;
  let user: any;
  let job: any;
  let token: any;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [JobManagementModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    jobRepository = module.get<JobRepository>(JobRepository);
  });

  beforeEach(async () => {
    user = userFactory.build({
      role: 'ADMIN',
    });
    job = jobFactory.build();
    await testDbClient(Tables.identity_tb_users).insert(user);
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2025-08-08'));
  });

  afterEach(async () => {
    await testDbClient(Tables.job_management_tb_jobs).del();
    await testDbClient(Tables.identity_tb_users).del();
    await jobRepository.clear();
  });

  afterAll(async () => {
    await testDbClient.destroy();
    await module.close();
    fs.rmSync('./uploads', { recursive: true, force: true });
  });

  describe('/job-management (POST)', () => {
    it('should create a job successfully', async () => {
      token = await signInFactory(user.email, user.password);
      await request(app.getHttpServer())
        .post('/job-management/register')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(job)
        .expect(HttpStatus.CREATED)
        .expect((response) => {
          expect(response.body).toMatchObject({
            title: job.title,
            company: job.company,
            location: job.location,
            url: job.url,
          });
        });
    });
    it('should create a job successfully with excel', async () => {
      token = await signInFactory(user.email, user.password);
      const response = await request(app.getHttpServer())
        .post('/job-management/uploadJobs')
        .set('Authorization', `Bearer ${token.accessToken}`)
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
    it('should reject invalid parameters', async () => {
      token = await signInFactory(user.email, user.password);
      const invalidJob = jobFactory.build({
        url: 'testando.br',
        title: undefined,
        company: undefined,
      });
      await request(app.getHttpServer())
        .post('/job-management/register')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(invalidJob)
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          message: [
            'Must be a string',
            'title should not be empty',
            'Must be a string',
            'company should not be empty',
            'URL is not a valid.',
          ],
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });

  it('retrieve job by company', async () => {
    token = await signInFactory(user.email, user.password);
    await testDbClient(Tables.job_management_tb_jobs).insert(job);
    await request(app.getHttpServer())
      .get(`/job-management/companies/`)
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toEqual({
          companyCount: 1,
        });
      });
  });
  it('retrieve jobs', async () => {
    token = await signInFactory(user.email, user.password);
    const jobsArray = jobFactory.buildList(15);
    await testDbClient(Tables.job_management_tb_jobs).insert(jobsArray);
    await request(app.getHttpServer())
      .get(`/job-management`)
      .set('Authorization', `Bearer ${token.accessToken}`)
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
          jobsArray
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .reverse()
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
