import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
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
      imports: [AppModule],
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

  describe('/sign_in (POST)', () => {
    it('sign in a user', async () => {
      const signInput = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      await userManagementService.createUser(signInput);
      const acessTokenResponse = await request(app.getHttpServer())
        .post('/auth/sign_in')
        .send({
          email: signInput.email,
          password: signInput.password,
        })
        .expect(200);
      expect(acessTokenResponse.body.data.accessToken).toBeDefined();
      //   const response = await request(app.getHttpServer())
      //     .post()
      //     .set('Authorization', `Bearer ${acessTokenResponse}`);
    });
  });
});
