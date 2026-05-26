import { ExecutionContext } from '@nestjs/common';
import { InsufficientPermissionException } from '@sharedModule/core/exception/insufficient-permission.exception';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { AdminGuard } from '../../admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let identityAuthenticateApi: jest.Mocked<IdentityAuthenticateApi>;

  const createContext = (user: { id: string; role: string }) => {
    const request = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    identityAuthenticateApi = {
      authenticate: jest.fn(),
      hasPermission: jest.fn(),
      hasAdminPermission: jest.fn(),
      assertResourceAccess: jest.fn(),
    };
    guard = new AdminGuard(identityAuthenticateApi);
  });

  it('should allow admin users', async () => {
    identityAuthenticateApi.hasAdminPermission.mockResolvedValue(true);
    const context = createContext({ id: 'admin-1', role: 'ADMIN' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(identityAuthenticateApi.hasAdminPermission).toHaveBeenCalledWith({
      id: 'admin-1',
      role: 'ADMIN',
    });
  });

  it('should reject non-admin users', async () => {
    identityAuthenticateApi.hasAdminPermission.mockRejectedValue(
      new InsufficientPermissionException('Admin access required.'),
    );
    const context = createContext({ id: 'user-1', role: 'USER' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      InsufficientPermissionException,
    );
  });
});
