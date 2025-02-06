import { Module } from '@nestjs/common';
import { ConfigModule } from '@sharedModule/config/config.module';
import { PrismaModule } from '@sharedModule/prisma/prisma.module';
import { CandidatesReportController } from './http/controller/candidates-report.controller';
import { IdentityModule } from '@identityModule/identity.module';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { IdentityPublicApiProvider } from '@identityModule/integration/provider/public-api.provider';
import { CandidatesReportService } from './core/service/candidates-report.service';
import { CandidatesReportRepository } from './persistence/repository/candidates-report.repository';

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
