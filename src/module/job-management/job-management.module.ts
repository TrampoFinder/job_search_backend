import { Module } from '@nestjs/common';
import { JobRepository } from '@jobManagementModule/persistence/repository/job.repository';
import { PrismaModule } from '@sharedModule/prisma/prisma.module';
import { JobApplicationRepository } from '@jobManagementModule/persistence/repository/job-application.repository';
import { ConfigModule } from '@sharedModule/config/config.module';
import { JobApplicationManagementService } from '@jobManagementModule/core/service/job-application-management.service';
import { JobManagementService } from '@jobManagementModule/core/service/job-management.service';
import { JobApplicationController } from '@jobManagementModule/http/controller/job-application.controller';
import { JobController } from '@jobManagementModule/http/controller/job.controller';
import FavoriteJobRepository from './persistence/repository/favorite-job.repository';
import { FavoriteJobController } from './http/controller/favorite-job.controller';
import FavoriteJobService from './core/service/favorite-job.service';
@Module({
  imports: [ConfigModule.forRoot(), PrismaModule],
  controllers: [JobController, JobApplicationController, FavoriteJobController],
  providers: [
    JobManagementService,
    JobApplicationManagementService,
    JobRepository,
    JobApplicationRepository,
    FavoriteJobService,
    FavoriteJobRepository,
  ],
  exports: [JobApplicationManagementService],
})
export class JobManagementModule {}
