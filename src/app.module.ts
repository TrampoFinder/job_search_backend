import { Module } from '@nestjs/common';
import { JobManagementModule } from '@src/module/job-management/job-management.module';
import { ReportManagementModule } from '@src/module/report-management/report-management.module';
import { IdentityModule } from '@src/module/identity/identity.module';

@Module({
  imports: [IdentityModule, JobManagementModule, ReportManagementModule],
})
export class AppModule {}
