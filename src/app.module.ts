import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JobManagementModule } from '@jobManagementModule/job-management.module';
import { ReportManagementModule } from '@reportManagementModule/report-management.module';
import { IdentityModule } from '@identityModule/identity.module';
import { IdentityIntegrationModule } from '@identityModule/integration/identity-integration.module';
import { SharedAuthModule } from '@sharedModule/auth/auth.module';
import { JwtAuthGuard } from '@sharedModule/auth/guard/jwt-auth.guard';
import { DomainExceptionFilter } from '@sharedModule/integration/http/filter/domain-exception.filter';

@Module({
  imports: [
    IdentityIntegrationModule,
    SharedAuthModule,
    IdentityModule,
    JobManagementModule,
    ReportManagementModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
