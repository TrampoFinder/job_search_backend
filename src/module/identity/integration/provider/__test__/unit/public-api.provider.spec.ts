import { RoleUserType } from '@identityModule/core/model/user.model';
import { AuthService } from '@identityModule/core/service/authentication.service';
import { UserRepository } from '@identityModule/persistence/repository/user.repository';
import { InsufficientPermissionException } from '@sharedModule/core/exception/insufficient-permission.exception';
import { NotFoundException } from '@sharedModule/core/exception/not-found.exception';
import { IdentityPublicApiProvider } from '@identityModule/integration/provider/public-api.provider';

describe('IdentityPublicApiProvider', () => {
  let provider: IdentityPublicApiProvider;
  let authService: jest.Mocked<AuthService>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    authService = {
      validateToken: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
    userRepository = {
      findByOne: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    provider = new IdentityPublicApiProvider(authService, userRepository);
  });

  describe('hasAdminPermission', () => {
    it('should allow admin users', async () => {
      await expect(
        provider.hasAdminPermission({
          id: 'admin-1',
          role: RoleUserType.ADMIN,
        }),
      ).resolves.toBe(true);
    });

    it('should reject non-admin users with 403', async () => {
      await expect(
        provider.hasAdminPermission({ id: 'user-1', role: RoleUserType.USER }),
      ).rejects.toThrow(InsufficientPermissionException);
    });
  });

  describe('assertResourceAccess', () => {
    it('should allow user to access own resource', async () => {
      await expect(
        provider.assertResourceAccess(
          { id: 'user-1', role: RoleUserType.USER },
          'user-1',
        ),
      ).resolves.toBeUndefined();
    });

    it('should reject user accessing another user resource', async () => {
      await expect(
        provider.assertResourceAccess(
          { id: 'user-1', role: RoleUserType.USER },
          'user-2',
        ),
      ).rejects.toThrow(InsufficientPermissionException);
    });

    it('should allow admin to access own resource', async () => {
      await expect(
        provider.assertResourceAccess(
          { id: 'admin-1', role: RoleUserType.ADMIN },
          'admin-1',
        ),
      ).resolves.toBeUndefined();
      expect(userRepository.findByOne).not.toHaveBeenCalled();
    });

    it('should allow admin to access user resource', async () => {
      userRepository.findByOne.mockResolvedValue({
        id: 'user-2',
        role: RoleUserType.USER,
      } as never);

      await expect(
        provider.assertResourceAccess(
          { id: 'admin-1', role: RoleUserType.ADMIN },
          'user-2',
        ),
      ).resolves.toBeUndefined();
    });

    it('should reject admin accessing another admin resource', async () => {
      userRepository.findByOne.mockResolvedValue({
        id: 'admin-2',
        role: RoleUserType.ADMIN,
      } as never);

      await expect(
        provider.assertResourceAccess(
          { id: 'admin-1', role: RoleUserType.ADMIN },
          'admin-2',
        ),
      ).rejects.toThrow(InsufficientPermissionException);
    });

    it('should throw not found when target user does not exist', async () => {
      userRepository.findByOne.mockResolvedValue(undefined);

      await expect(
        provider.assertResourceAccess(
          { id: 'admin-1', role: RoleUserType.ADMIN },
          'missing-user',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('hasPermission', () => {
    it('should delegate to assertResourceAccess when userId is provided', async () => {
      userRepository.findByOne.mockResolvedValue({
        id: 'user-2',
        role: RoleUserType.USER,
      } as never);

      await expect(
        provider.hasPermission(
          { id: 'admin-1', role: RoleUserType.ADMIN },
          'user-2',
        ),
      ).resolves.toBe(true);
    });

    it('should return true when userId is omitted', async () => {
      await expect(
        provider.hasPermission({ id: 'user-1', role: RoleUserType.USER }),
      ).resolves.toBe(true);
    });
  });
});
