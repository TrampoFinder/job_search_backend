export interface IdentityAuthenticateApi {
  authenticate(
    token: string | undefined,
  ): Promise<{ id: string; role: string }>;
  hasPermission(
    userAuthenticated: { id: string; role: string },
    token: string | undefined,
  ): Promise<boolean>;
}

export const IdentityAuthenticateApi = Symbol('IdentityAuthenticateApi');
