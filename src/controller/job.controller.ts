import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  ValidationPipe,
  UsePipes,
  UseInterceptors,
} from '@nestjs/common';
import { CreateJobRequestDto } from '@src/dto/request/create-job-request.dto';
import { CreateJobResponseDto } from '@src/dto/response/create-job-response.dto';
import { RestResponseInterceptor } from '@src/interceptor/rest-response.interceptor';
import JobModel from '@src/model/job.model';
import { JobManagementService } from '@src/service/job-management.service';

@Controller('/job_management')
export class JobController {
  constructor(private readonly jobManagementService: JobManagementService) {}
  @Get()
  async listAll(): Promise<JobModel[]> {
    return this.jobManagementService.getAllJobs();
  }
  @Post('/register')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(new RestResponseInterceptor(CreateJobResponseDto))
  async create(
    @Body() createJobRequestDto: CreateJobRequestDto,
  ): Promise<CreateJobResponseDto> {
    try {
      const createdJob =
        await this.jobManagementService.createJob(createJobRequestDto);

      return {
        id: createdJob.id,
        title: createdJob.title,
        description: createdJob.description,
        url: createdJob.url,
        createdAt: createdJob.createdAt,
        updatedAt: createdJob.updatedAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
