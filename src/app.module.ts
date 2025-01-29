import { DynamicModule, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions as NestConfigModuleOptions,
} from '@nestjs/config';
import { factory } from './util/config.factory';
import { JobController } from './controller/job.controller';
import { JobManagementService } from './service/job-management.service';
import { PrismaService } from './prisma/prisma.service';
import { JobRepository } from './repository/job.repository';

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
