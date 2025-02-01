import { Module } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';
import { JobManagementModule } from './job-management/job-management.module';

@Module({
  imports: [IdentityModule, JobManagementModule],
})
export class AppModule {}
