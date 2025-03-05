/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';

import {
  CanActivate,
  ContextType,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@sharedModule/config/service/config.service';
import { AuthenticatedRequest } from '@sharedModule/integration/interface/authenticate-request.interface';
import { UserManagementService } from '@identityModule/core/service/user-management.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userManagement: UserManagementService,
    private readonly configService: ConfigService,
  ) {}
  canActivate = async (context: ExecutionContext): Promise<boolean> => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return false;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('secret').key,
      });
      const user = await this.userManagement.getUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Credentials are not authorized');
      }
      request.user = user;
    } catch (error) {
      throw new UnauthorizedException('Credentials are not authorized');
    }
    return true;
  };
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.get('Authorization')?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
