import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import os from 'os';
import path from 'path';
import { CandidatesReportService } from '@reportManagementModule/core/service/candidates-report.service';
import { InvalidFileReportGeneratorException } from '@reportManagementModule/core/exception/invalid-file-report-generator .exceptions';

@Injectable()
export class ReportExportService {
  constructor(
    private readonly candidatesReportService: CandidatesReportService,
  ) {}

  exportCandidatesReport = async (): Promise<{
    filePath: string;
    fileName: string;
  }> => {
    try {
      const report = await this.candidatesReportService.getReport();
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
      report.forEach((item) => {
        worksheet.addRow({
          fullName: item.fullName,
          notProcessing: item.notProcessing,
          applied: item.applied,
          inProgress: item.inProgress,
          approved: item.approved,
          rejected: item.rejected,
          closed: item.closed,
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

      const fileName = 'candidates-report.xlsx';
      const filePath = path.join(os.tmpdir(), fileName);
      await workbook.xlsx.writeFile(filePath);

      return { filePath, fileName };
    } catch (error) {
      if (error instanceof InvalidFileReportGeneratorException) {
        throw error;
      }
      throw new InvalidFileReportGeneratorException('Error generating file');
    }
  };
}
