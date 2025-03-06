import { RoleUserType } from '@identityModule/core/model/user.model';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InsufficientPermissionException } from '@sharedModule/core/exception/insufficient-permission.exception';
import { AuthenticatedRequest } from '@sharedModule/integration/interface/authenticate-request.interface';

@Injectable()
export class PermissionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (user.role === RoleUserType.ADMIN) {
      const resourceUserId = request.params.id;
      if (resourceUserId && resourceUserId !== user.id) {
        throw new InsufficientPermissionException(
          'Admins cannot access resources of other admins',
        );
      }
    } else if (user.role === RoleUserType.USER) {
      const resourceUserId = request.params.id;

      if (resourceUserId && resourceUserId !== user.id) {
        throw new InsufficientPermissionException(
          'Users can only access their own resources',
        );
      }
    }

    return true;
  }
}
