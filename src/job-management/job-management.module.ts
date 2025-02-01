import { Module } from '@nestjs/common';
import { JobController } from './controller/job.controller';
import { JobManagementService } from './service/job-management.service';
import { JobRepository } from './repository/job.repository';
import { ConfigModule } from '@src/config/config.module';
import { PrismaModule } from '@src/prisma/prisma.module';



@Module({
  imports: [ConfigModule.forRoot(), PrismaModule],
  controllers: [JobController],
  providers: [JobManagementService, JobRepository],
})
export class JobManagementModule {}
