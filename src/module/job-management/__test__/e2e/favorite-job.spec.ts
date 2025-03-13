import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobManagementModule } from '@jobManagementModule/job-management.module';
import { JobRepository } from '@jobManagementModule/persistence/repository/job.repository';
import request from 'supertest';
import FavoriteJobRepository from '@jobManagementModule/persistence/repository/favorite-job.repository';
import { testDbClient } from '@testInfra/knex.database';
import { Tables } from '@testInfra/enum/tables.enum';
import { userFactory } from '@testInfra/factory/user.test-factory';
import { jobFactory } from '@testInfra/factory/job.test-factory';
import { signInFactory } from '@testInfra/factory/sign-in.test-factory';
import FavoriteJobService from '@jobManagementModule/core/service/favorite-job.service';

describe('JobController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let favoriteJobRepository: FavoriteJobRepository;
  let favoriteJobService: FavoriteJobService;
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

    favoriteJobRepository = module.get<FavoriteJobRepository>(
      FavoriteJobRepository,
    );
    favoriteJobService = module.get<FavoriteJobService>(FavoriteJobService);
    jobRepository = module.get<JobRepository>(JobRepository);
  });

  beforeEach(async () => {
    user = userFactory.build();
    job = jobFactory.build();
    await testDbClient(Tables.identity_tb_users).insert(user);
    await testDbClient(Tables.job_management_tb_jobs).insert(job);
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2025-08-08'));
  });

  afterEach(async () => {
    await testDbClient(Tables.job_management_tb_jobs).del();
    await testDbClient(Tables.identity_tb_users).del();
    await jobRepository.clear();
    await favoriteJobRepository.clear();
  });

  afterAll(async () => {
    await testDbClient.destroy();
    await module.close();
  });

  describe('/favorites-job (POST)', () => {
    it('should create a favorite job successfully', async () => {
      token = await signInFactory(user.email, user.password);
      await request(app.getHttpServer())
        .post(`/favorites-job/${job.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect(HttpStatus.CREATED)
        .expect((response) => {
          expect(response.body.favoriteJob.id).toBeDefined();
          expect(response.body.favoriteJob.userId).toBe(user.id);
          expect(response.body.favoriteJob.jobId).toBe(job.id);
        });
    });
    it('should throw error when the favorite job ID is invalid', async () => {
      token = await signInFactory(user.email, user.password);
      await request(app.getHttpServer())
        .post('/favorites-job/register')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
  describe('/favorites-job (GET)', () => {
    it('should retrieve a favorites jobs successfully', async () => {
      token = await signInFactory(user.email, user.password);
      await favoriteJobService.addFavoriteJob(job.id, user.id);
      await request(app.getHttpServer())
        .get('/favorites-job')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect(HttpStatus.OK);
    });
  });
  describe('/favorites-job/:id (DELETE)', () => {
    it('should delete a favorite job successfully', async () => {
      token = await signInFactory(user.email, user.password);
      await favoriteJobService.addFavoriteJob(job.id, user.id);
      await request(app.getHttpServer())
        .delete(`/favorites-job/${job.id}/remove`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect(HttpStatus.NO_CONTENT);
    });
    it('should throw error when the job ID is invalid', async () => {
      token = await signInFactory(user.email, user.password);
      await request(app.getHttpServer())
        .delete('/favorites-job/register/remove')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
