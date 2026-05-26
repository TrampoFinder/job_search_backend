import { Global, Module } from '@nestjs/common';
import { AdminGuard } from './guard/admin.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { OwnershipGuard } from './guard/ownership.guard';

@Global()
@Module({
  providers: [JwtAuthGuard, AdminGuard, OwnershipGuard],
  exports: [JwtAuthGuard, AdminGuard, OwnershipGuard],
})
export class SharedAuthModule {}
