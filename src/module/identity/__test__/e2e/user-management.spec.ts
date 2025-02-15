import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IdentityModule } from '@identityModule/identity.module';
import { UserRepository } from '@identityModule/persistence/repository/user.repository';
import request from 'supertest';
import { UserManagementService } from '../../core/service/user-management.service';

describe('UserManagement (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let userRepository: UserRepository;
  let userManagementService: UserManagementService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [IdentityModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    userManagementService = module.get<UserManagementService>(
      UserManagementService,
    );
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

  describe('/users/register (POST)', () => {
    it('should create a new user successfully', async () => {
      const userRegister = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      await request(app.getHttpServer())
        .post('/users/register')
        .send(userRegister)
        .expect(201);
    });

    it('should create a new user with email exists', async () => {
      const userRegister = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      await userManagementService.createUser(userRegister);
      await request(app.getHttpServer())
        .post('/users/register')
        .send(userRegister)
        .expect(409);
    });
  });
});
