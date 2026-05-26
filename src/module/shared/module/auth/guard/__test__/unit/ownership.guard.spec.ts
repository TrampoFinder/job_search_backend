import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsufficientPermissionException } from '@sharedModule/core/exception/insufficient-permission.exception';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { OWNERSHIP_PARAM_KEY } from '../../../constant/auth-metadata.constant';
import { OwnershipGuard } from '../../ownership.guard';

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;
  let identityAuthenticateApi: jest.Mocked<IdentityAuthenticateApi>;
  let reflector: jest.Mocked<Reflector>;

  const createContext = (
    user: { id: string; role: string },
    params: Record<string, string>,
  ) => {
    const request = { user, params };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    identityAuthenticateApi = {
      authenticate: jest.fn(),
      hasPermission: jest.fn(),
      hasAdminPermission: jest.fn(),
      assertResourceAccess: jest.fn(),
    };
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new OwnershipGuard(identityAuthenticateApi, reflector);
  });

  it('should delegate to assertResourceAccess with configured param', async () => {
    reflector.getAllAndOverride.mockImplementation((key) =>
      key === OWNERSHIP_PARAM_KEY ? 'id' : undefined,
    );
    identityAuthenticateApi.assertResourceAccess.mockResolvedValue(undefined);
    const context = createContext(
      { id: 'admin-1', role: 'ADMIN' },
      { id: 'user-2' },
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(identityAuthenticateApi.assertResourceAccess).toHaveBeenCalledWith(
      { id: 'admin-1', role: 'ADMIN' },
      'user-2',
    );
  });

  it('should allow when ownership metadata is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createContext(
      { id: 'user-1', role: 'USER' },
      { id: 'user-2' },
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(identityAuthenticateApi.assertResourceAccess).not.toHaveBeenCalled();
  });

  it('should propagate permission errors', async () => {
    reflector.getAllAndOverride.mockReturnValue('userId');
    identityAuthenticateApi.assertResourceAccess.mockRejectedValue(
      new InsufficientPermissionException(
        'Users can only access their own resources.',
      ),
    );
    const context = createContext(
      { id: 'user-1', role: 'USER' },
      { userId: 'user-2' },
    );

    await expect(guard.canActivate(context)).rejects.toThrow(
      InsufficientPermissionException,
    );
  });
});
