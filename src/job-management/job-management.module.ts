import { Module } from '@nestjs/common';
import { JobController } from './controller/job.controller';
import { JobManagementService } from './service/job-management.service';
import { JobRepository } from './repository/job.repository';

@Module({
  controllers: [JobController],
  providers: [JobManagementService, JobRepository],
})
export class JobManagementModule {}
