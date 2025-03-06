import { UserRepository } from '@identityModule/persistence/repository/user.repository';
import { AuthService } from '../../authentication.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModel } from '@identityModule/core/model/user.model';
import crypto from 'crypto';
import { ConfigModule } from '@sharedModule/config/config.module';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
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
});
