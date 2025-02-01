import { Module } from '@nestjs/common';

import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/authentication.service';
import { UserManagementService } from './service/user-management.service';
import { ConfigModule } from '@src/config/config.module';
import { UserRepository } from './repository/user.repository';
import { PrismaModule } from '@src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@src/config/service/config.service';
import { UserController } from './controller/user.controller';
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
})
export class IdentityModule {}
