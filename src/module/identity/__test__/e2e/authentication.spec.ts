import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementService } from '@identityModule/core/service/user-management.service';
import { IdentityModule } from '@identityModule/identity.module';
import { UserRepository } from '@identityModule/persistence/repository/user.repository';
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
    it('should sign in a user with valid credentials', async () => {
      const signInput = {
        firstName: 'John',
        lastName: 'Doe',
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
        .expect(200);
      expect(acessTokenResponse.body.accessToken).toBeDefined();
      const response = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set('Authorization', `Bearer ${acessTokenResponse.body.accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
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
