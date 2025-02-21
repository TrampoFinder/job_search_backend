import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { ConfigService } from '@sharedModule/config/service/config.service';
import { UserNotFoundException } from '@identityModule/core/exception/user-not-found.exception';
import { UserManagementService } from '@identityModule/core/service/user-management.service';

@Injectable()
export class IdentityPublicApiProvider implements IdentityAuthenticateApi {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userManagementService: UserManagementService,
    private readonly configService: ConfigService,
  ) {}

  async authenticate(token: string | undefined) {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('secret').key,
      });
      const user = await this.userManagementService.getUserById(payload.sub);
      if (!user) {
        throw new UserNotFoundException('User not found');
      }

      return { id: user.id, role: user.role };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid token');
    }
  }
  async hasPermission(
    userAuthenticated: { id: string; role: string },
    userId: string,
  ): Promise<boolean> {
    if (userAuthenticated.role === 'USER' && userAuthenticated.id !== userId) {
      throw new UnauthorizedException('You do not have permission.');
    }
    return true;
  }
  async hasAdminPermission(
    userAuthenticated: { id: string; role: string },
    userId: string,
  ): Promise<boolean> {
    if (userAuthenticated.role !== 'ADMIN' && userAuthenticated.id !== userId) {
      throw new UnauthorizedException('You do not have permission.');
    }
    return true;
  }
}
