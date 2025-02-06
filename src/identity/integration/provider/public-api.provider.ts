import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserManagementService } from '../service/user-management.service';
import { UserNotFoundException } from '../exception/user-not-found.exception';
import { IdentityAuthenticateApi } from '@src/shared/module/integration/interface/identity-integration.interface';
import { ConfigService } from '@src/shared/module/config/service/config.service';

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
}
