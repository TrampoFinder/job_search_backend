import { Injectable } from '@nestjs/common';
import { CreateJobRequestDto } from '@src/job-management/dto/request/create-job-request.dto';
import JobModel from '@src/job-management/model/job.model';

import { JobRepository } from '@src/job-management/repository/job.repository';

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
