import { Module } from '@nestjs/common';
import { ConfigModule } from '@sharedModule/config/config.module';
import { PrismaModule } from '@sharedModule/prisma/prisma.module';
import { CandidatesReportController } from './http/controller/candidates-report.controller';
import { CandidatesReportService } from './core/service/candidates-report.service';
import { ReportExportService } from './core/service/report-export.service';
import { CandidatesReportRepository } from './persistence/repository/candidates-report.repository';
import { JobManagementIntegrationModule } from '../job-management/integration/job-management-integration.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    JobManagementIntegrationModule,
  ],
  controllers: [CandidatesReportController],
  providers: [
    CandidatesReportService,
    ReportExportService,
    CandidatesReportRepository,
  ],
})
export class ReportManagementModule {}
