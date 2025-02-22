import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  Query,
} from '@nestjs/common';
import JobModel from '@jobManagementModule/core/model/job.model';
import { JobManagementService } from '@jobManagementModule/core/service/job-management.service';
import { CreateJobRequestDto } from '@jobManagementModule/http/dto/request/create-job-request.dto';

@Controller('job-management')
export class JobController {
  constructor(private readonly jobManagementService: JobManagementService) {}
  @Get()
  async listAll(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('location') location?: string,
    @Query('companyName') companyName?: string,
  ): Promise<{ jobs: JobModel[]; total: number; totalPages: number }> {
    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 10;
    const { jobs, total } = await this.jobManagementService.getAllJobs(
      pageNumber,
      pageSizeNumber,
      location,
      companyName,
    );
    return {
      jobs,
      total,
      totalPages: Math.ceil(total / pageSizeNumber),
    };
  }
  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createJobRequestDto: CreateJobRequestDto,
  ): Promise<JobModel> {
    return await this.jobManagementService.createJob(createJobRequestDto);
  }

  @Get('companies')
  async getJobsByCompanyCount(): Promise<{ companyCount: number }> {
    const jobsCompany = await this.jobManagementService.getJobsByCompanyCount();
    return {
      companyCount: jobsCompany,
    };
  }
}
