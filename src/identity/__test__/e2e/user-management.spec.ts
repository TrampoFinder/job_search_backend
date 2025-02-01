import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IdentityModule } from '@src/identity/identity.module';
import { UserRepository } from '@src/identity/repository/user.repository';
import request from 'supertest';

describe('UserManagement (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let userRepository: UserRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [IdentityModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    userRepository = module.get<UserRepository>(UserRepository);
  });

  beforeEach(async () => {
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2025-02-02'));
  });

  afterEach(async () => {
    await userRepository.clear();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('/user/register (POST)', () => {
    it('creates a user', async () => {
      const userRegister = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      const response = await request(app.getHttpServer())
        .post('/user/register')
        .send(userRegister)
        .expect(201);
      expect(response.body).toMatchObject(userRegister);
    });
  });
});
