import { Module } from '@nestjs/common';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { PrismaModule } from '@src/shared/module/prisma/prisma.module';
import { CandidatesReportController } from './controller/candidates-report.controller';
import { CandidatesReportService } from './service/candidates-report.service';
import { CandidatesReportRepository } from './repository/candidates-report.repository';
import { IdentityModule } from '@src/identity/identity.module';
import { IdentityAuthenticateApi } from '@src/shared/module/integration/interface/identity-integration.interface';
import { IdentityPublicApiProvider } from '@src/identity/provider/public-api.provider';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, IdentityModule],
  controllers: [CandidatesReportController],
  providers: [
    CandidatesReportService,
    CandidatesReportRepository,
    {
      provide: IdentityAuthenticateApi,
      useExisting: IdentityPublicApiProvider,
    },
  ],
})
export class ReportManagementModule {}
