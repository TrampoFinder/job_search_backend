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
import { JobApplicationPublicApiProvider } from './integration/provider/public-api.provider';
import { APP_FILTER } from '@nestjs/core';
import { DomainExceptionFilter } from '@sharedModule/integration/http/filter/domain-exception.filter';
import FavoriteJobRepository from './persistence/repository/favorite-job.repository';
import { FavoriteJobController } from './http/controller/favorite-job.controller';
import FavoriteJobService from './core/service/favorite-job.service';
@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, IdentityModule],
  controllers: [JobController, JobApplicationController, FavoriteJobController],
  providers: [
    JobManagementService,
    JobApplicationManagementService,
    JobRepository,
    JobApplicationRepository,
    JobApplicationPublicApiProvider,
    FavoriteJobService,
    FavoriteJobRepository,
    {
      provide: IdentityAuthenticateApi,
      useExisting: IdentityPublicApiProvider,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
  exports: [JobApplicationPublicApiProvider],
})
export class JobManagementModule {}
