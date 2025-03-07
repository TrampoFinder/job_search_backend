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
}

export const IdentityAuthenticateApi = Symbol('IdentityAuthenticateApi');
