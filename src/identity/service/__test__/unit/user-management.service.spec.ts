import { UserRepository } from '@src/identity/repository/user.repository';
import { UserManagementService } from '../../user-management.service';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '@src/shared/module/prisma/prisma.service';
import { UserModel } from '@src/identity/model/user.model';
import { ConfigModule } from '@src/shared/module/config/config.module';

describe('UserManagement', () => {
  let userManagementService: UserManagementService;
  let userRepository: UserRepository;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [UserManagementService, UserRepository, PrismaService],
    }).compile();

    userManagementService = module.get<UserManagementService>(
      UserManagementService,
    );
    userRepository = module.get<UserRepository>(UserRepository);
  });
  describe('Management service', () => {
    it('creates a new user', async () => {
      const mockUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'test',
        password: 'test',
        salt: 'random_salt',
      };
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValueOnce(UserModel.create(mockUser));
      const createUser = await userManagementService.createUser(mockUser);
      const { email, password, firstName, lastName } = createUser;
      expect(email).toBe('test@example.com');
      expect(password).toBe('test');
      expect(firstName).toBe('Test');
      expect(lastName).toBe('User');
    });

    it('get user by id', async () => {
      const mockUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'test',
        password: 'test',
        salt: 'random_salt',
      };
      const newUser = UserModel.create(mockUser);
      jest.spyOn(userRepository, 'findByOne').mockResolvedValueOnce(newUser);
      const getUserById = await userManagementService.getUserById(newUser.id);
      const { email, password, firstName, lastName, id } = getUserById;
      expect(id).toBe(newUser.id);
      expect(email).toBe('test@example.com');
      expect(password).toBe('test');
      expect(firstName).toBe('Test');
      expect(lastName).toBe('User');
    });
  });
});
