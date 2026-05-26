import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@sharedModule/core/exception/unauthorized.exception';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { IS_PUBLIC_KEY } from '../../../constant/auth-metadata.constant';
import { JwtAuthGuard } from '../../jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let identityAuthenticateApi: jest.Mocked<IdentityAuthenticateApi>;
  let reflector: jest.Mocked<Reflector>;

  const createContext = (headers: Record<string, string> = {}) => {
    const request = {
      headers,
      user: undefined,
      get: (name: string) => headers[name.toLowerCase()] ?? headers[name],
    };
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
    guard = new JwtAuthGuard(identityAuthenticateApi, reflector);
  });

  it('should allow access to public routes without token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(identityAuthenticateApi.authenticate).not.toHaveBeenCalled();
  });

  it('should authenticate and attach user when token is valid', async () => {
    reflector.getAllAndOverride.mockImplementation((key) =>
      key === IS_PUBLIC_KEY ? false : undefined,
    );
    identityAuthenticateApi.authenticate.mockResolvedValue({
      id: 'user-1',
      role: 'USER',
    });
    const context = createContext({ authorization: 'Bearer valid-token' });
    const request = context.switchToHttp().getRequest();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(identityAuthenticateApi.authenticate).toHaveBeenCalledWith(
      'valid-token',
    );
    expect(request.user).toEqual({ id: 'user-1', role: 'USER' });
  });

  it('should propagate authentication errors', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    identityAuthenticateApi.authenticate.mockRejectedValue(
      new UnauthorizedException('Credentials are not authorized'),
    );
    const context = createContext({ authorization: 'Bearer invalid-token' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should call authenticate with undefined when authorization header is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    identityAuthenticateApi.authenticate.mockRejectedValue(
      new UnauthorizedException('Credentials are not authorized'),
    );
    const context = createContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(identityAuthenticateApi.authenticate).toHaveBeenCalledWith(
      undefined,
    );
  });
});
