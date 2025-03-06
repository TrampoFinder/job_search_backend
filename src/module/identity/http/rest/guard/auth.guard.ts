/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';

import {
  CanActivate,
  ContextType,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '@sharedModule/integration/interface/authenticate-request.interface';
import { AuthService } from '@identityModule/core/service/authentication.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  canActivate = async (context: ExecutionContext): Promise<boolean> => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);
    try {
      const user = await this.authService.validateToken(token);
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
