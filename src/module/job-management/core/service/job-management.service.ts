import { Injectable } from '@nestjs/common';
import { CreateJobRequestDto } from '@jobManagementModule/http/dto/request/create-job-request.dto';
import { JobRepository } from '@jobManagementModule/persistence/repository/job.repository';
import JobModel from '@jobManagementModule/core/model/job.model';

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
