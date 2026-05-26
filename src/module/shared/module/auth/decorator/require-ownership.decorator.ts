import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { OWNERSHIP_PARAM_KEY } from '../constant/auth-metadata.constant';
import { OwnershipGuard } from '../guard/ownership.guard';

export const RequireOwnership = (param: string) =>
  applyDecorators(
    SetMetadata(OWNERSHIP_PARAM_KEY, param),
    UseGuards(OwnershipGuard),
  );
