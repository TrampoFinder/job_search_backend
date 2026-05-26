import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from '@sharedModule/integration/interface/authenticate-request.interface';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(IdentityAuthenticateApi)
    private readonly identityAuthenticateApi: IdentityAuthenticateApi,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    await this.identityAuthenticateApi.hasAdminPermission(request.user);
    return true;
  }
}
