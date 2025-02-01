import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IdentityModule } from '@src/identity/identity.module';
import { UserRepository } from '@src/identity/repository/user.repository';
import { UserManagementService } from '@src/identity/service/user-management.service';
import request from 'supertest';

describe('AuthController (e2e)', () => {
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

  describe('/sign-in (POST)', () => {
    it('sign in a user', async () => {
      const signInput = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      const user = await userManagementService.createUser(signInput);
      const acessTokenResponse = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: signInput.email,
          password: signInput.password,
        })
        .expect(201);
      expect(acessTokenResponse.body.accessToken).toBeDefined();
      const response = await request(app.getHttpServer())
        .get(`/user/${user.id}`)
        .set('Authorization', `Bearer ${acessTokenResponse.body.accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        role: user.role,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        deletedAt: null,
      });
    });
  });
});
