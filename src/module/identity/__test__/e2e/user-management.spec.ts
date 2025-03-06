import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IdentityModule } from '@identityModule/identity.module';
import { UserRepository } from '@identityModule/persistence/repository/user.repository';
import request from 'supertest';
import { UserManagementService } from '../../core/service/user-management.service';
import { AuthService } from '@identityModule/core/service/authentication.service';

describe('UserManagement (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let userRepository: UserRepository;
  let userManagementService: UserManagementService;
  let authService: AuthService;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [IdentityModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    userManagementService = module.get<UserManagementService>(
      UserManagementService,
    );
    authService = module.get<AuthService>(AuthService);
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

    it('should try create a new user with email exists', async () => {
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
  describe('/users/:id (PATCH)', () => {
    it('should update a user successfully', async () => {
      const userRegister = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      const userOutput = await userManagementService.createUser(userRegister);
      const signInOutput = await authService.signIn({
        email: userRegister.email,
        password: userRegister.password,
      });

      await request(app.getHttpServer())
        .patch(`/users/${userOutput.id}`)
        .set('Authorization', `Bearer ${signInOutput.accessToken}`)
        .send({ email: 'johndoe2@example.com', password: 'password987' })
        .expect(204);
    });
    it('should return 409 Conflict when updating with an existing email', async () => {
      const userRegister = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      const userOutput = await userManagementService.createUser(userRegister);
      const signInOutput = await authService.signIn({
        email: userRegister.email,
        password: userRegister.password,
      });

      const response = await request(app.getHttpServer())
        .patch(`/users/${userOutput.id}`)
        .set('Authorization', `Bearer ${signInOutput.accessToken}`)
        .send({ email: 'johndoe@example.com' })
        .expect(409);
      expect(response.body).toEqual({
        message: 'Email already in use!',
        statusCode: 409,
        error: 'Conflict',
      });
    });
  });
  describe('/users/:id (DELETE)', () => {
    it('should delete a user successfully', async () => {
      const userRegister = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      const userOutput = await userManagementService.createUser(userRegister);
      const signInOutput = await authService.signIn({
        email: userRegister.email,
        password: userRegister.password,
      });
      await request(app.getHttpServer())
        .delete(`/users/${userOutput.id}`)
        .set('Authorization', `Bearer ${signInOutput.accessToken}`)
        .expect(204);
    });
    it('should return 403 Forbidden when try deleting with valid token other user', async () => {
      const userRegister = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };
      await userManagementService.createUser(userRegister);
      const userRegister2 = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe2@example.com',
        password: 'password123',
      };
      const userOutput2 = await userManagementService.createUser(userRegister2);
      const signInOutput = await authService.signIn({
        email: userRegister.email,
        password: userRegister.password,
      });
      await request(app.getHttpServer())
        .delete(`/users/${userOutput2.id}`)
        .set('Authorization', `Bearer ${signInOutput.accessToken}`)
        .expect(403);
    });
  });
});
