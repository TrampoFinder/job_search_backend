import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions as NestConfigModuleOptions,
} from '@nestjs/config';
import { factory } from './util/config.factory';
import { JobController } from './controller/job.controller';

@Module({
  imports: [
    NestConfigModule.forRoot({
      expandVariables: true,
      load: [factory],
    }),
  ],
  controllers: [AppController, JobController],
  providers: [AppService, JobService],
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
      controllers: [AppController],
      providers: [AppService],
    };
  }
}
