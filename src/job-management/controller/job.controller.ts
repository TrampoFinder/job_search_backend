import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { CreateJobRequestDto } from '@src/job-management/dto/request/create-job-request.dto';
import JobModel from '@src/job-management/model/job.model';
import { JobManagementService } from '@src/job-management/service/job-management.service';

@Controller('job-management')
export class JobController {
  constructor(private readonly jobManagementService: JobManagementService) {}
  @Get()
  async listAll(): Promise<JobModel[]> {
    return this.jobManagementService.getAllJobs();
  }
  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createJobRequestDto: CreateJobRequestDto,
  ): Promise<JobModel> {
    return await this.jobManagementService.createJob(createJobRequestDto);
  }
}
