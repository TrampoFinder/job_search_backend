import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementService } from '@identityModule/core/service/user-management.service';
import { IdentityModule } from '@identityModule/identity.module';
import { UserRepository } from '@identityModule/persistence/repository/user.repository';
import request from 'supertest';
import { AuthService } from '@identityModule/core/service/authentication.service';
import { JwtService } from '@nestjs/jwt';
import { EmailSenderService } from '@sharedModule/notification/service/email-sender.service';

describe('AuthController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let userRepository: UserRepository;
  let userManagementService: UserManagementService;
  let authService: AuthService;
  let jwtService: JwtService;
  let emailService: EmailSenderService;

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
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailSenderService>(EmailSenderService);
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
  describe('/auth/recovery-password (POST)', () => {
    it('should send a recovery email successfully', async () => {
      const userRegister = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'andrewairamdasilva@gmail.com',
        password: 'password123',
      };
      await userManagementService.createUser(userRegister);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue();
      await request(app.getHttpServer())
        .post('/auth/recovery-password')
        .send({ email: userRegister.email })
        .expect(204);
    });
    it('should return 401 Unauthorized when try sending recovery email with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/recovery-password')
        .send({ email: 'johndoe22@example.com' })
        .expect(401);
    });
  });
  describe('/auth/reset-password (POST)', () => {
    it('should reset a password successfully', async () => {
      const userRegister = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      const userOutput = await userManagementService.createUser(userRegister);
      const token = 'fake-token';
      const recoveryCode = 'testcode';
      const recoveryCodeExpiredAt = new Date(Date.now() + 15 * 60 * 1000);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        sub: userOutput.id,
      });
      jest.spyOn(authService, 'validateToken').mockResolvedValue({
        id: userOutput.id,
        role: userOutput.role,
      });
      await userRepository.update(userOutput.id, {
        recoveryCode,
        recoveryCodeExpiredAt,
      });
      await request(app.getHttpServer())
        .post(`/auth/reset-password/${token}`)
        .send({
          password: 'newpassword123',
          recoveryCode,
        })
        .expect(204);
      const updatedUser = await userRepository.findByOne({ id: userOutput.id });
      expect(updatedUser?.password).not.toBe(userOutput.password);
      expect(updatedUser?.recoveryCode).toBeNull();
      expect(updatedUser?.recoveryCodeExpiredAt).toBeNull();
    });
  });
});
