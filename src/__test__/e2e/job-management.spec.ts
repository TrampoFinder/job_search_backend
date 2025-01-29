import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { JobRepository } from '@src/repository/job.repository';
import request from 'supertest';

describe('ContentController (e2e)', () => {
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
  });
});
