import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { IdentityIntegrationModule } from '@identityModule/integration/identity-integration.module';
import { SharedAuthModule } from '@sharedModule/auth/auth.module';
import { JwtAuthGuard } from '@sharedModule/auth/guard/jwt-auth.guard';
import { DomainExceptionFilter } from '@sharedModule/integration/http/filter/domain-exception.filter';

export const e2eAuthImports = [IdentityIntegrationModule, SharedAuthModule];

export const e2eAuthProviders = [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_FILTER,
    useClass: DomainExceptionFilter,
  },
];
