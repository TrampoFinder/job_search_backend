import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { JobRepository } from '@src/job-management/repository/job.repository';
import request from 'supertest';

describe('JobController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let jobRepository: JobRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    jobRepository = module.get<JobRepository>(JobRepository);
  });

  beforeEach(async () => {
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2025-02-02'));
  });

  afterEach(async () => {
    await jobRepository.clear();
  });

  afterAll(async () => {
    module.close();
  });

  describe('/job_search (POST)', () => {
    it('create a job', async () => {
      const input = {
        title: 'Test Job',
        description: 'Job in R. Rego Freitas',
        url: 'https://republicarr.jobs.com.br/',
      };

      await request(app.getHttpServer())
        .post('/job_management/register')
        .send(input)
        .expect(HttpStatus.CREATED)
        .expect((response) => {
          expect(response.body).toMatchObject({
            title: input.title,
            description: input.description,
            url: input.url,
          });
        });
    });
    it('throws an error when the url is invalid', async () => {
      const input = {
        title: 'Test Job',
        description: 'Job in R. Rego Freitas',
        url: 'republicarr.br',
      };

      await request(app.getHttpServer())
        .post('/job_management/register')
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

  it('does not allow parameters invalid', async () => {
    const input = {
      title: 1234,
      description: 95156,
      url: 'republicarr.br',
    };
    await request(app.getHttpServer())
      .post('/job_management/register')
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
});
