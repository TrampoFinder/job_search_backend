import { Module } from '@nestjs/common';
import { JobManagementModule } from '@jobManagementModule/job-management.module';
import { ReportManagementModule } from '@reportManagementModule/report-management.module';
import { IdentityModule } from '@identityModule/identity.module';

@Module({
  imports: [IdentityModule, JobManagementModule, ReportManagementModule],
})
export class AppModule {}
