import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNERSHIP_PARAM_KEY } from '../constant/auth-metadata.constant';
import { AuthenticatedRequest } from '@sharedModule/integration/interface/authenticate-request.interface';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    @Inject(IdentityAuthenticateApi)
    private readonly identityAuthenticateApi: IdentityAuthenticateApi,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const paramKey = this.reflector.getAllAndOverride<string>(
      OWNERSHIP_PARAM_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!paramKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const rawTargetUserId = request.params[paramKey];
    const targetUserId = Array.isArray(rawTargetUserId)
      ? rawTargetUserId[0]
      : rawTargetUserId;
    if (!targetUserId) {
      return true;
    }

    await this.identityAuthenticateApi.assertResourceAccess(
      request.user,
      targetUserId,
    );
    return true;
  }
}
