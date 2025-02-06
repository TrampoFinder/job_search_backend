import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import JobModel from '@jobManagementModule/core/model/job.model';
import { JobManagementService } from '@jobManagementModule/core/service/job-management.service';
import { CreateJobRequestDto } from '@jobManagementModule/http/dto/request/create-job-request.dto';

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
