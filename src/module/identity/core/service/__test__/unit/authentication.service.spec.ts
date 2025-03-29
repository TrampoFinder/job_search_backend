import { UserRepository } from '@identityModule/persistence/repository/user.repository';
import { AuthService } from '../../authentication.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModel } from '@identityModule/core/model/user.model';
import crypto from 'crypto';
import { ConfigModule } from '@sharedModule/config/config.module';
import { EmailSenderService } from '@sharedModule/notification/service/email-sender.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let emailSenderService: EmailSenderService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByOne: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: EmailSenderService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
    emailSenderService = module.get<EmailSenderService>(EmailSenderService);
  });
  describe('signIn', () => {
    it('should return an access token when valid credentials are provided', async () => {
      const mockUser = {
        id: '123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'test',
        password: 'test',
      };
      const token = 'testingtoken';
      const PASSWORD_HASH_SALT = crypto.randomBytes(20).toString('hex');
      const encryptedPassword = crypto
        .pbkdf2Sync(mockUser.password, PASSWORD_HASH_SALT, 100000, 64, 'sha512')
        .toString('hex');

      jest.spyOn(userRepository, 'findByOne').mockResolvedValue(
        UserModel.create({
          ...mockUser,
          password: encryptedPassword,
          salt: PASSWORD_HASH_SALT,
        }),
      );
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'test',
      });

      expect(userRepository.findByOne).toHaveBeenCalledWith({
        email: mockUser.email,
      });
      expect(userRepository.findByOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });

      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: token });
    });
  });
  describe('recoveryPassword', () => {
    it('should send a password recovery email', async () => {
      const mockUser = {
        id: '123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'test',
        password: 'test',
      };
      const token = 'testingtoken';
      const recoveryCode = 'testcode';
      const recoveryCodeExpiredAt = new Date();

      const PASSWORD_HASH_SALT = crypto.randomBytes(20).toString('hex');
      const encryptedPassword = crypto
        .pbkdf2Sync(mockUser.password, PASSWORD_HASH_SALT, 100000, 64, 'sha512')
        .toString('hex');
      const userCreated = UserModel.create({
        ...mockUser,
        password: encryptedPassword,
        salt: PASSWORD_HASH_SALT,
      });
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(userCreated);
      jest.spyOn(userRepository, 'update').mockResolvedValue({
        ...userCreated,
        recoveryCode,
        recoveryCodeExpiredAt,
      });
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);
      jest.spyOn(emailSenderService, 'sendEmail').mockResolvedValue();
      await authService.recoveryPassword('test@example.com');

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalled();
      expect(emailSenderService.sendEmail).toHaveBeenCalled();
    });
  });
  describe('resetPassword', () => {
    it('should update the user password and remove recovery code', async () => {
      const mockUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'test',
        password: 'test',
      };
      const recoveryCode = 'testcode';
      const recoveryCodeExpiredAt = new Date(Date.now() + 15 * 60 * 1000);

      const PASSWORD_HASH_SALT = crypto.randomBytes(20).toString('hex');
      const encryptedPassword = crypto
        .pbkdf2Sync(mockUser.password, PASSWORD_HASH_SALT, 100000, 64, 'sha512')
        .toString('hex');
      const userCreated = UserModel.create({
        ...mockUser,
        password: encryptedPassword,
        salt: PASSWORD_HASH_SALT,
      });
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ sub: userCreated.id });
      jest.spyOn(userRepository, 'findByOne').mockResolvedValue({
        ...userCreated,
        recoveryCode,
        recoveryCodeExpiredAt,
      });
      jest.spyOn(userRepository, 'update').mockResolvedValue({
        ...userCreated,
        recoveryCode: null,
        recoveryCodeExpiredAt: null,
      });
      await authService.resetPassword(
        'fake-token',
        recoveryCode,
        'newpassword',
      );
      expect(userRepository.findByOne).toHaveBeenCalledWith({
        id: userCreated.id,
      });
      expect(userRepository.update).toHaveBeenCalledWith(
        userCreated.id,
        expect.objectContaining({
          recoveryCode: null,
          recoveryCodeExpiredAt: null,
        }),
      );
    });
  });
});
