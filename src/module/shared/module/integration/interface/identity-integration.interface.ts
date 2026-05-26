export interface IdentityAuthenticateApi {
  authenticate(
    token: string | undefined,
  ): Promise<{ id: string; role: string }>;
  hasPermission(
    userAuthenticated: { id: string; role: string },
    userId?: string | undefined,
  ): Promise<boolean>;
  hasAdminPermission(
    userAuthenticated: { id: string; role: string },
    userId?: string | undefined,
  ): Promise<boolean>;
  assertResourceAccess(
    userAuthenticated: { id: string; role: string },
    targetUserId: string,
  ): Promise<void>;
}

export const IdentityAuthenticateApi = Symbol('IdentityAuthenticateApi');
