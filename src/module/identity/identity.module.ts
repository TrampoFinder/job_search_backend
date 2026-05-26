import { Module } from '@nestjs/common';
import { PrismaModule } from '@sharedModule/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from '@sharedModule/config/config.module';
import { ConfigService } from '@sharedModule/config/service/config.service';
import { AuthService } from './core/service/authentication.service';
import { UserManagementService } from './core/service/user-management.service';
import { AuthController } from './http/rest/controller/auth.controller';
import { UserController } from './http/rest/controller/user.controller';
import { UserRepository } from './persistence/repository/user.repository';
import { NotificationModule } from '@sharedModule/notification/notificiation.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('secret').key,
      }),
    }),
    PrismaModule,
    NotificationModule,
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserManagementService, UserRepository],
  exports: [AuthService, UserRepository],
})
export class IdentityModule {}
