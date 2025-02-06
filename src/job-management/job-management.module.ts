import { Module } from '@nestjs/common';
import { JobController } from './controller/job.controller';
import { JobManagementService } from './service/job-management.service';
import { JobRepository } from './repository/job.repository';
import { PrismaModule } from '@src/shared/module/prisma/prisma.module';
import { JobApplicationController } from './controller/job-application.controller';
import { JobApplicationManagementService } from './service/job-application-management.service';
import { JobApplicationRepository } from './repository/job-application.repository';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { IdentityModule } from '@src/identity/identity.module';
import { IdentityAuthenticateApi } from '@src/shared/module/integration/interface/identity-integration.interface';
import { IdentityPublicApiProvider } from '@src/identity/provider/public-api.provider';
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
