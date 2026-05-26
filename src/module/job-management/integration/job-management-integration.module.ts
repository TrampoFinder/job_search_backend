import { Module } from '@nestjs/common';
import { JobApplicationApi } from '@sharedModule/integration/interface/job-application-integration.interface';
import { JobManagementModule } from '@jobManagementModule/job-management.module';
import { JobApplicationPublicApiProvider } from './provider/public-api.provider';

@Module({
  imports: [JobManagementModule],
  providers: [
    JobApplicationPublicApiProvider,
    {
      provide: JobApplicationApi,
      useExisting: JobApplicationPublicApiProvider,
    },
  ],
  exports: [JobApplicationApi],
})
export class JobManagementIntegrationModule {}
