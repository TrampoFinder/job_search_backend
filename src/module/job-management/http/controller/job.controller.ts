import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import JobModel from '@jobManagementModule/core/model/job.model';
import { JobManagementService } from '@jobManagementModule/core/service/job-management.service';
import { CreateJobRequestDto } from '@jobManagementModule/http/dto/request/create-job-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { RestResponseInterceptor } from '@sharedLibs/util/interceptor/rest-response.interceptor';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import * as ExcelJS from 'exceljs';
import { CreateJobResponseDto } from '../dto/response/created-job-response.dto';
import { Public } from '@sharedModule/auth/decorator/public.decorator';
import { RequireAdmin } from '@sharedModule/auth/decorator/require-admin.decorator';

@Controller('job-management')
export class JobController {
  constructor(private readonly jobManagementService: JobManagementService) {}

  @Public()
  @Get()
  async getAllJobs(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('location') location?: string,
    @Query('companyName') companyName?: string,
  ): Promise<{
    data: JobModel[];
    total: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  }> {
    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 10;

    return await this.jobManagementService.getAllJobs(
      pageNumber,
      pageSizeNumber,
      location,
      companyName,
    );
  }

  @RequireAdmin()
  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createJobRequestDto: CreateJobRequestDto,
  ): Promise<JobModel> {
    return await this.jobManagementService.createJob(createJobRequestDto);
  }

  @Public()
  @Get('companies')
  async getJobsByCompanyCount(): Promise<{ companyCount: number }> {
    const jobsCompany = await this.jobManagementService.getJobsByCompanyCount();
    return {
      companyCount: jobsCompany,
    };
  }

  @RequireAdmin()
  @Post('uploadJobs')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          return cb(
            null,
            `${Date.now()}-${randomUUID()}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowedMime =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const allowedExt = '.xlsx';

        if (
          file.mimetype !== allowedMime ||
          extname(file.originalname).toLowerCase() !== allowedExt
        ) {
          return cb(
            new BadRequestException(
              'Invalid file type. Only .xlsx files are supported.',
            ),
            false,
          );
        }
        return cb(null, true);
      },
    }),
  )
  @UseInterceptors(new RestResponseInterceptor(CreateJobResponseDto))
  async uploadJobs(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CreateJobResponseDto[]> {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.getWorksheet(4);
    const jobRequests: CreateJobRequestDto[] = [];
    if (!worksheet) {
      throw new BadRequestException('No data found in the provided file.');
    }
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const urlValue = row.getCell(6).value;
      const urlParse =
        urlValue && typeof urlValue === 'object' && (urlValue as any).hyperlink
          ? (urlValue as any).hyperlink
          : '';
      const jobRequestDto: CreateJobRequestDto = {
        company: row.getCell(1).value?.toString() || '',
        title: row.getCell(5).value?.toString() || '',
        url: urlParse,
        location: row.getCell(7).value?.toString() || '',
      };
      jobRequests.push(jobRequestDto);
    });
    return await Promise.all(
      jobRequests.map(async (jobRequest) => {
        return await this.jobManagementService.createJob(jobRequest);
      }),
    );
  }
}
