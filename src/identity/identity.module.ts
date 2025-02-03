import { Module } from '@nestjs/common';

import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/authentication.service';
import { UserManagementService } from './service/user-management.service';
import { UserRepository } from './repository/user.repository';
import { PrismaModule } from '@src/shared/module/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './controller/user.controller';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { ConfigService } from '@src/shared/module/config/service/config.service';
@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('secret').key,
        signOptions: { expiresIn: '60m', algorithm: 'HS256' },
      }),
    }),
    PrismaModule,
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserManagementService, UserRepository],
  exports: [JwtModule, UserManagementService],
})
export class IdentityModule {}
