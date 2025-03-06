import { Module } from '@nestjs/common';
import { PrismaModule } from '@sharedModule/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from '@sharedModule/config/config.module';
import { ConfigService } from '@sharedModule/config/service/config.service';
import { AuthService } from './core/service/authentication.service';
import { UserManagementService } from './core/service/user-management.service';
import { AuthController } from './http/rest/controller/auth.controller';
import { UserController } from './http/rest/controller/user.controller';
import { IdentityPublicApiProvider } from './integration/provider/public-api.provider';
import { UserRepository } from './persistence/repository/user.repository';
import { APP_FILTER } from '@nestjs/core';
import { DomainExceptionFilter } from '@sharedModule/integration/http/filter/domain-exception.filter';

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
  providers: [
    AuthService,
    UserManagementService,
    UserRepository,
    IdentityPublicApiProvider,
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
  exports: [IdentityPublicApiProvider],
})
export class IdentityModule {}
