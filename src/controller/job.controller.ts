import {
  Controller,
  Get,
  Post,
  //Delete,
  Body,
  //Param,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import JobModel from '@src/model/job.model';
import { JobService } from '@src/service/job.service';

@Controller('job_search')
export class JobController {
  constructor(private readonly jobService: JobService) {}
  @Get()
  async listAll(): Promise<JobModel[]> {
    return this.jobService.listAll();
  }
  @Post()
  async create(@Body() jobRequestDto: JobRequestDto): Promise<JobResponseDto> {
    try {
      const createdJob = await this.jobService.save(jobRequestDto);
      return createdJob;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
type JobRequestDto = {
  title: string;
  description: string;
  link: string;
};

type JobResponseDto = {
  id: string;
  title: string;
  description: string;
  link: string;
  status: string;
};
