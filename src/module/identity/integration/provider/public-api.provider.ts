import { Injectable } from '@nestjs/common';
import { RoleUserType } from '@identityModule/core/model/user.model';
import { UserRepository } from '@identityModule/persistence/repository/user.repository';
import { InsufficientPermissionException } from '@sharedModule/core/exception/insufficient-permission.exception';
import { NotFoundException } from '@sharedModule/core/exception/not-found.exception';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { AuthService } from '@identityModule/core/service/authentication.service';

@Injectable()
export class IdentityPublicApiProvider implements IdentityAuthenticateApi {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  async authenticate(
    token: string | undefined,
  ): Promise<{ id: string; role: string }> {
    return this.authService.validateToken(token);
  }

  async hasPermission(
    userAuthenticated: { id: string; role: string },
    userId?: string | undefined,
  ): Promise<boolean> {
    if (!userId) {
      return true;
    }
    await this.assertResourceAccess(userAuthenticated, userId);
    return true;
  }

  async hasAdminPermission(userAuthenticated: {
    id: string;
    role: string;
  }): Promise<boolean> {
    if (userAuthenticated.role !== RoleUserType.ADMIN) {
      throw new InsufficientPermissionException('Admin access required.');
    }
    return true;
  }

  async assertResourceAccess(
    userAuthenticated: { id: string; role: string },
    targetUserId: string,
  ): Promise<void> {
    if (userAuthenticated.role === RoleUserType.USER) {
      if (targetUserId !== userAuthenticated.id) {
        throw new InsufficientPermissionException(
          'Users can only access their own resources.',
        );
      }
      return;
    }

    if (userAuthenticated.role === RoleUserType.ADMIN) {
      if (targetUserId === userAuthenticated.id) {
        return;
      }

      const targetUser = await this.userRepository.findByOne({
        id: targetUserId,
      });
      if (!targetUser) {
        throw new NotFoundException('User not found!');
      }
      if (targetUser.role === RoleUserType.ADMIN) {
        throw new InsufficientPermissionException(
          'Admins cannot access resources of other admins',
        );
      }
    }
  }
}
