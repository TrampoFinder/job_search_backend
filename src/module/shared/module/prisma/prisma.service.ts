import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@sharedModule/config/service/config.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown
{
  private logger = new Logger(PrismaService.name);
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('database.url'),
        },
      },
    });
  }
  async onModuleInit() {
    this.logger.log({
      message: 'Connecting to Prisma on database module initialization',
    });
    await this.$connect();
  }

  async onModuleDestroy() {
    this.logger.log({
      message: 'Disconnecting from Prisma on database module shutdown',
    });
    await this.$disconnect();
  }
  onApplicationShutdown(signal?: string) {
    this.logger.log({
      message: 'Prisma client disconnected due to application shutdown',
      signal,
    });
    this.$disconnect();
  }
}
