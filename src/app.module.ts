import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions as NestConfigModuleOptions,
} from '@nestjs/config';
import { factory } from './util/config.factory';

@Module({
  imports: [
    NestConfigModule.forRoot({
      expandVariables: true,
      load: [factory],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
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
