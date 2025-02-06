/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';
import { UserModel } from '../model/user.model';
import {
  CanActivate,
  ContextType,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserManagementService } from '../service/user-management.service';
import { ConfigService } from '@src/shared/module/config/service/config.service';
import { AuthenticatedRequest } from '@src/shared/module/integration/interface/authenticate-request.interface';
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
        throw new UnauthorizedException();
      }
      request.user = user;
    } catch (error) {
      throw new UnauthorizedException();
    }
    return true;
  };
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.get('Authorization')?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
