import { Module } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';
import { JobManagementModule } from './job-management/job-management.module';
import { ReportManagementModule } from './report-management.module';

@Module({
  imports: [IdentityModule, JobManagementModule, ReportManagementModule],
})
export class AppModule {}
