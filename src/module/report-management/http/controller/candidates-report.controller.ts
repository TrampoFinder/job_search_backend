import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';

import * as ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { Response } from 'express';
import { AuthenticatedRequest } from '@sharedModule/integration/interface/authenticate-request.interface';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { RestResponseInterceptor } from '@src/module/shared/util/interceptor/rest-response.interceptor';
import { CandidatesReportNotFoundException } from '@reportManagementModule/core/exception/candidates-report-not-found.exception';
import { InvalidFileReportGeneratorException } from '@reportManagementModule/core/exception/invalid-file-report-generator .exceptions';
import { CandidatesReportService } from '@reportManagementModule/core/service/candidates-report.service';
import { CandidatesStatisticDto } from '@reportManagementModule/http/dto/candidates-statistic.dto';
import { JobApplicationApi } from '@src/module/shared/module/integration/interface/job-application-integration.interface';
import { CandidatesReportDto } from '../dto/candidates-report.dto';

@Controller('candidates-report')
export class CandidatesReportController {
  constructor(
    @Inject(IdentityAuthenticateApi)
    private readonly identityAuthenticateApi: IdentityAuthenticateApi,
    private readonly candidatesReportService: CandidatesReportService,
    @Inject(JobApplicationApi)
    private readonly jobApplicationApi: JobApplicationApi,
  ) {}
  @Get('view')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new RestResponseInterceptor(CandidatesStatisticDto))
  async getCandidatesViewReport(
    @Req() req: AuthenticatedRequest,
  ): Promise<CandidatesStatisticDto[]> {
    const token = req.headers.authorization?.split(' ')[1];
    const autheticatedUser =
      await this.identityAuthenticateApi.authenticate(token);
    await this.identityAuthenticateApi.hasAdminPermission(
      autheticatedUser,
      token,
    );
    return await this.candidatesReportService.getReport();
  }

  @Get('download')
  @HttpCode(HttpStatus.OK)
  async exportCandidatesReport(@Res() res: Response): Promise<void | Response> {
    try {
      const getReport = await this.candidatesReportService.getReport();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report Candidates');
      worksheet.columns = [
        {
          header: 'NOME COMPLETO',
          key: 'fullName',
          width: 60,
          style: {
            font: {
              name: 'Arial',
              size: 12,
              bold: true,
            },
            alignment: { horizontal: 'center' },
          },
        },
        {
          header: 'NÃO ELEGÍVEL',
          key: 'notProcessing',
          width: 60,
          style: {
            font: {
              name: 'Arial',
              size: 12,
              bold: true,
            },
            alignment: { horizontal: 'center' },
          },
        },
        {
          header: 'CANDIDATURA ENVIADA',
          key: 'applied',
          width: 60,
          style: {
            font: {
              name: 'Arial',
              size: 12,
              bold: true,
            },
            alignment: { horizontal: 'center' },
          },
        },
        {
          header: 'EM ANDAMENTO',
          key: 'inProgress',
          width: 60,
          style: {
            font: {
              name: 'Arial',
              size: 12,
              bold: true,
            },
            alignment: { horizontal: 'center' },
          },
        },
        {
          header: 'APROVADO',
          key: 'approved',
          width: 60,
          style: {
            font: {
              name: 'Arial',
              size: 12,
              bold: true,
            },
            alignment: { horizontal: 'center' },
          },
        },
        {
          header: 'REPROVADO',
          key: 'rejected',
          width: 60,
          style: {
            font: {
              name: 'Arial',
              size: 12,
              bold: true,
            },
            alignment: { horizontal: 'center' },
          },
        },
        {
          header: 'VAGAS FECHADAS',
          key: 'closed',
          width: 60,
          style: {
            font: {
              name: 'Arial',
              size: 12,
              bold: true,
            },
            alignment: { horizontal: 'center' },
          },
        },
      ];
      getReport.forEach((report) => {
        worksheet.addRow({
          fullName: report.fullName,
          notProcessing: report.notProcessing,
          applied: report.applied,
          inProgress: report.inProgress,
          approved: report.approved,
          rejected: report.rejected,
          closed: report.closed,
        });
      });
      const headerRow = worksheet.getRow(1);
      headerRow.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0000FF' },
      };
      headerRow.alignment = { horizontal: 'center' };
      const tempDir = os.tmpdir();
      const fileName = `candidates-report.xlsx`;
      const filePath = path.join(tempDir, fileName);
      await workbook.xlsx.writeFile(filePath);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.download(filePath, 'candidates-report.xlsx', (err) => {
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

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new RestResponseInterceptor(CandidatesReportDto))
  async getJobApplicationsReport(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<CandidatesReportDto[]> {
    const token = req.headers.authorization?.split(' ')[1];
    const autheticatedUser =
      await this.identityAuthenticateApi.authenticate(token);
    await this.identityAuthenticateApi.hasAdminPermission(
      autheticatedUser,
      token,
    );
    const jobApplications = await this.jobApplicationApi.getJobApplications(
      page,
      pageSize,
    );
    return jobApplications;
  }
}
