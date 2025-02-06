import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { CandidatesReportService } from '../service/candidates-report.service';
import * as ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { Response } from 'express';
import { InvalidFileReportGeneratorException } from '../exception/invalid-file-report-generator .exceptions';
import { CandidatesReportNotFoundException } from '../exception/candidates-report-not-found.exception';
import { RestResponseInterceptor } from '@src/shared/util/interceptor/rest-response.interceptor';
import { CandidatesStatisticDto } from '../dto/candidates-statistic.dto';
import { IdentityAuthenticateApi } from '@src/shared/module/integration/interface/identity-integration.interface';
import { AuthenticatedRequest } from '@src/shared/module/integration/interface/authenticate-request.interface';
@Controller('/candidates-report')
export class CandidatesReportController {
  constructor(
    @Inject(IdentityAuthenticateApi)
    private readonly identityAuthenticateApi: IdentityAuthenticateApi,
    private readonly candidatesReportService: CandidatesReportService,
  ) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new RestResponseInterceptor(CandidatesStatisticDto))
  async getCandidatesReport(
    @Req() req: AuthenticatedRequest,
  ): Promise<CandidatesStatisticDto[]> {
    const token = req.headers.authorization?.split(' ')[1];
    await this.identityAuthenticateApi.authenticate(token);
    return await this.candidatesReportService.getReport();
  }

  @Get('/download')
  @HttpCode(HttpStatus.OK)
  async exportCandidatesReport(@Res() res: Response): Promise<void | Response> {
    try {
      const getReport = await this.candidatesReportService.getReport();
      const totalCount = getReport.length;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report Candidates');
      worksheet.columns = [
        { header: 'Nome Completo', key: 'fullName', width: 20 },
        { header: 'Não Elegível', key: 'notProcessing', width: 20 },
        { header: 'Candidatura Enviada', key: 'applied', width: 20 },
        { header: 'Em Andamento', key: 'inProgress', width: 20 },
        { header: 'Aprovado', key: 'approved', width: 20 },
        { header: 'Rejeitado', key: 'rejected', width: 20 },
        { header: 'Vaga Fechada', key: 'closed', width: 20 },
      ];
      getReport.forEach((report) => {
        const notProcessingPercentage =
          (report.notProcessing / totalCount) * 100;
        const appliedPercentage = (report.applied / totalCount) * 100;
        const inProgressPercentage = (report.inProgress / totalCount) * 100;
        const approvedPercentage = (report.approved / totalCount) * 100;
        const rejectedPercentage = (report.rejected / totalCount) * 100;
        const closedPercentage = (report.closed / totalCount) * 100;
        worksheet.addRow({
          fullName: report.fullName,
          notProcessing: `${notProcessingPercentage.toFixed(2)}%`,
          applied: `${appliedPercentage.toFixed(2)}%`,
          inProgress: `${inProgressPercentage.toFixed(2)}%`,
          approved: `${approvedPercentage.toFixed(2)}%`,
          rejected: `${rejectedPercentage.toFixed(2)}%`,
          closed: `${closedPercentage.toFixed(2)}%`,
        });
      });
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
}
