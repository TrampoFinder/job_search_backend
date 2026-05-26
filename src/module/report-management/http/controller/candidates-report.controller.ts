import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';

import fs from 'fs';
import { Response } from 'express';
import { RestResponseInterceptor } from '@sharedLibs/util/interceptor/rest-response.interceptor';
import { CandidatesReportNotFoundException } from '@reportManagementModule/core/exception/candidates-report-not-found.exception';
import { InvalidFileReportGeneratorException } from '@reportManagementModule/core/exception/invalid-file-report-generator .exceptions';
import { CandidatesReportService } from '@reportManagementModule/core/service/candidates-report.service';
import { ReportExportService } from '@reportManagementModule/core/service/report-export.service';
import {
  CandidatesStatisticDto,
  CandidatesStatisticList,
} from '@reportManagementModule/http/dto/candidates-statistic.dto';
import { JobApplicationApi } from '@sharedModule/integration/interface/job-application-integration.interface';
import { CandidatesReportDto } from '../dto/candidates-report.dto';
import { NotFoundException } from '@sharedModule/core/exception/not-found.exception';
import { RequireAdmin } from '@sharedModule/auth/decorator/require-admin.decorator';
import { RequireOwnership } from '@sharedModule/auth/decorator/require-ownership.decorator';

@Controller('candidates-report')
export class CandidatesReportController {
  constructor(
    private readonly candidatesReportService: CandidatesReportService,
    private readonly reportExportService: ReportExportService,
    @Inject(JobApplicationApi)
    private readonly jobApplicationApi: JobApplicationApi,
  ) {}

  @RequireAdmin()
  @Get('view')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new RestResponseInterceptor(CandidatesStatisticDto))
  async getCandidatesViewReport(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{
    data: CandidatesStatisticList[];
    total: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  }> {
    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 10;
    return await this.candidatesReportService.getReportPaginate(
      pageNumber,
      pageSizeNumber,
    );
  }

  @RequireAdmin()
  @Get('download')
  @HttpCode(HttpStatus.OK)
  async exportCandidatesReport(@Res() res: Response): Promise<void | Response> {
    try {
      const { filePath, fileName } =
        await this.reportExportService.exportCandidatesReport();
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.download(filePath, fileName, (err) => {
        if (err) {
          throw new InvalidFileReportGeneratorException('Error sending file');
        }
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      if (error instanceof CandidatesReportNotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
        });
      }
      if (error instanceof InvalidFileReportGeneratorException) {
        return res.status(HttpStatus.CONFLICT).send({
          message: error.message,
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
        });
      }
      throw error;
    }
  }

  @RequireAdmin()
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new RestResponseInterceptor(CandidatesReportDto))
  async getJobApplicationsReport(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ): Promise<CandidatesReportDto> {
    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 20;
    return await this.jobApplicationApi.getJobApplications(
      pageNumber,
      pageSizeNumber,
    );
  }

  @RequireOwnership('id')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new RestResponseInterceptor(CandidatesStatisticList))
  async getCandidateReportById(
    @Param('id') id: string,
  ): Promise<CandidatesStatisticList> {
    const candidateReport =
      await this.candidatesReportService.getReportByUserId(id);
    if (!candidateReport) {
      throw new NotFoundException('Report not found for the given candidate');
    }
    return candidateReport;
  }
}
