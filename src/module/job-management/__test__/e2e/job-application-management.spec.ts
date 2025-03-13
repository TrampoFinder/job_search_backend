import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobManagementModule } from '@jobManagementModule/job-management.module';
import { JobApplicationRepository } from '@jobManagementModule/persistence/repository/job-application.repository';
import request from 'supertest';
import { testDbClient } from '@testInfra/knex.database';
import { Tables } from '@testInfra/enum/tables.enum';
import { userFactory } from '@testInfra/factory/user.test-factory';
import { jobFactory } from '@testInfra/factory/job.test-factory';
import { signInFactory } from '@testInfra/factory/sign-in.test-factory';
import { jobApplicationAppliedFactory } from '@testInfra/factory/job-application.test-factory';
describe('JobApplicationController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let jobApplicationRepository: JobApplicationRepository;
  let user: any;
  let job: any;
  let jobApplicationRejectFactory: any;
  let token: any;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [JobManagementModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    jobApplicationRepository = module.get<JobApplicationRepository>(
      JobApplicationRepository,
    );
  });

  beforeEach(async () => {
    user = userFactory.build();
    job = jobFactory.build();
    jobApplicationRejectFactory = jobApplicationAppliedFactory.build({
      userId: user.id,
      jobId: job.id,
    });
    await testDbClient(Tables.identity_tb_users).insert(user);
    await testDbClient(Tables.job_management_tb_jobs).insert(job);
    await testDbClient(
      Tables.job_management_tb_job_application_processes,
    ).insert(jobApplicationRejectFactory);
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2025-08-08'));
  });

  afterEach(async () => {
    await testDbClient(
      Tables.job_management_tb_job_application_processes,
    ).del();
    await testDbClient(Tables.job_management_tb_jobs).del();
    await testDbClient(Tables.identity_tb_users).del();
    await jobApplicationRepository.clear();
  });

  afterAll(async () => {
    await testDbClient.destroy();
    await module.close();
  });

  describe('/job-application (POST)', () => {
    it('should apply a job successfully', async () => {
      token = await signInFactory(user.email, user.password);
      const response = await request(app.getHttpServer())
        .post(`/job-application/apply/${job.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(jobApplicationRejectFactory)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        title: jobApplicationRejectFactory.title,
        url: jobApplicationRejectFactory.url,
        jobId: job.id,
      });
    });
    it('should not allow invalid jobId', async () => {
      token = await signInFactory(user.email, user.password);
      await request(app.getHttpServer())
        .post('/job-application/apply/test')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(jobApplicationRejectFactory)
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
      token = await signInFactory(user.email, user.password);
      const jobApplicationFactory = jobApplicationAppliedFactory.buildList(14, {
        userId: user.id,
        jobId: job.id,
      });

      await testDbClient(Tables.job_management_tb_job_application_processes)
        .insert(jobApplicationFactory)
        .where({ userId: user.id })
        .orderBy('createdAt', 'desc')
        .limit(10);
      const response = await request(app.getHttpServer())
        .get(`/job-application/history`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect(HttpStatus.OK);
      expect(response.body.total).toBe(15);
      expect(response.body.totalPages).toBe(2);
      expect(response.body.previousPage).toBe(null);
      expect(response.body.nextPage).toBe(2);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });
  describe('JobApplication (PUT)', () => {
    it('should update job application status', async () => {
      token = await signInFactory(user.email, user.password);
      const updatedApplicationStatus = {
        status: 'IN_PROGRESS',
        note: 'WAIT RESPONSE',
      };
      const response = await request(app.getHttpServer())
        .put(
          `/job-application/${user.id}/${jobApplicationRejectFactory.id}/update`,
        )
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(updatedApplicationStatus)
        .expect(HttpStatus.OK);
      expect(response.body.status).toBe(updatedApplicationStatus.status);
      expect(response.body.note).toBe(updatedApplicationStatus.note);
    });
    it('should update job application with invalid params', async () => {
      token = await signInFactory(user.email, user.password);
      const updatedApplicationStatus = {
        status: 'IN_PROGRESS',
        note: 'WAIT RESPONSE',
      };
      const response = await request(app.getHttpServer())
        .put(`/job-application/${user.id}/test/update`)
        .set('Authorization', `Bearer ${token.accessToken}`)
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
