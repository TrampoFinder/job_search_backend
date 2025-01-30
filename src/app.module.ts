import { DynamicModule, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions as NestConfigModuleOptions,
} from '@nestjs/config';
import { factory } from './config/util/config.factory';
import { JobController } from './job-management/controller/job.controller';
import { PrismaService } from './prisma/prisma.service';
import { JobManagementService } from './job-management/service/job-management.service';
import { JobRepository } from './job-management/repository/job.repository';

@Module({
  imports: [
    NestConfigModule.forRoot({
      expandVariables: true,
      load: [factory],
    }),
  ],
  controllers: [JobController],
  providers: [PrismaService, JobManagementService, JobRepository],
})
export class AppModule {
  static forRoot(options?: NestConfigModuleOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [
        NestConfigModule.forRoot({
          ...options,
          load: options?.load ? [factory, ...options.load] : [factory],
        }),
      ],
      controllers: [JobController],
      providers: [PrismaService, JobManagementService, JobRepository],
    };
  }
}
