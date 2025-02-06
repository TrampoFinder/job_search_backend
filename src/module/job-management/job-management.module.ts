import { Module } from '@nestjs/common';
import { JobRepository } from '@jobManagementModule/persistence/repository/job.repository';
import { PrismaModule } from '@sharedModule/prisma/prisma.module';
import { JobApplicationRepository } from '@jobManagementModule/persistence/repository/job-application.repository';
import { ConfigModule } from '@sharedModule/config/config.module';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { JobApplicationManagementService } from '@jobManagementModule/core/service/job-application-management.service';
import { JobManagementService } from '@jobManagementModule/core/service/job-management.service';
import { JobApplicationController } from '@jobManagementModule/http/controller/job-application.controller';
import { JobController } from '@jobManagementModule/http/controller/job.controller';
import { IdentityPublicApiProvider } from '../identity/integration/provider/public-api.provider';
import { IdentityModule } from '../identity/identity.module';
@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, IdentityModule],
  controllers: [JobController, JobApplicationController],
  providers: [
    JobManagementService,
    JobApplicationManagementService,
    JobRepository,
    JobApplicationRepository,
    {
      provide: IdentityAuthenticateApi,
      useExisting: IdentityPublicApiProvider,
    },
  ],
})
export class JobManagementModule {}
