import { applyDecorators, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guard/admin.guard';

export const RequireAdmin = () => applyDecorators(UseGuards(AdminGuard));
