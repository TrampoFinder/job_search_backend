import { Injectable } from '@nestjs/common';
import { CreateJobRequestDto } from '@src/dto/request/create-job-request.dto';
import JobModel from '@src/model/job.model';

import { JobRepository } from '@src/repository/job.repository';

@Injectable()
export class JobManagementService {
  constructor(private readonly jobRepository: JobRepository) {}
  getAllJobs = async (): Promise<JobModel[]> => {
    return await this.jobRepository.getAllJobs();
  };

  createJob = async (data: CreateJobRequestDto): Promise<JobModel> => {
    const newJob = JobModel.create(data);
    return await this.jobRepository.save(newJob);
  };
}
