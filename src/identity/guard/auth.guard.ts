/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';
import { UserModel } from '../model/user.model';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserManagementService } from '../service/user-management.service';
import { ConfigService } from '@src/config/service/config.service';
export interface AuthenticatedRequest extends Request {
  user: UserModel;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userManagement: UserManagementService,
    private readonly configService: ConfigService,
  ) {}
  canActivate = async (context: ExecutionContext): Promise<boolean> => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.headers.authorization?.split(' ')[1];
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
}
