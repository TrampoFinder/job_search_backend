import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../constant/auth-metadata.constant';
import { AuthenticatedRequest } from '@sharedModule/integration/interface/authenticate-request.interface';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(IdentityAuthenticateApi)
    private readonly identityAuthenticateApi: IdentityAuthenticateApi,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);
    request.user = await this.identityAuthenticateApi.authenticate(token);
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.get('Authorization')?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
