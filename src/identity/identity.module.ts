import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/shared/module/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from '@src/shared/module/config/config.module';
import { ConfigService } from '@src/shared/module/config/service/config.service';
import { AuthService } from './core/service/authentication.service';
import { UserManagementService } from './core/service/user-management.service';
import { AuthController } from './http/rest/controller/auth.controller';
import { UserController } from './http/rest/controller/user.controller';
import { IdentityPublicApiProvider } from './integration/provider/public-api.provider';
import { UserRepository } from './persistence/repository/user.repository';

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
  ],
  exports: [IdentityPublicApiProvider],
})
export class IdentityModule {}
