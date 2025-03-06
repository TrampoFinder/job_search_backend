import { Injectable } from '@nestjs/common';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { AuthService } from '@identityModule/core/service/authentication.service';
import { RoleUserType } from '@identityModule/core/model/user.model';
import { UnauthorizedException } from '@sharedModule/core/exception/unauthorized.exception';

@Injectable()
export class IdentityPublicApiProvider implements IdentityAuthenticateApi {
  constructor(private readonly authService: AuthService) {}
  async authenticate(
    token: string | undefined,
  ): Promise<{ id: string; role: string }> {
    return this.authService.validateToken(token);
  }

  async hasPermission(
    userAuthenticated: { id: string; role: string },
    userId: string,
  ): Promise<boolean> {
    if (userAuthenticated.role === RoleUserType.ADMIN) {
      return true;
    }

    if (
      userAuthenticated.role === RoleUserType.USER &&
      userAuthenticated.id !== userId
    ) {
      throw new UnauthorizedException('You do not have permission.');
    }

    return true;
  }
  async hasAdminPermission(
    userAuthenticated: { id: string; role: string },
    userId: string,
  ): Promise<boolean> {
    if (userAuthenticated.role !== RoleUserType.ADMIN) {
      throw new UnauthorizedException('Admin access required.');
    }
    if (userAuthenticated.id !== userId) {
      throw new UnauthorizedException('You do not have permission.');
    }

    return true;
  }
}
