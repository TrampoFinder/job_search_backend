import { Injectable } from '@nestjs/common';
import { CreateJobRequestDto } from '@jobManagementModule/http/dto/request/create-job-request.dto';
import { JobRepository } from '@jobManagementModule/persistence/repository/job.repository';
import JobModel from '@jobManagementModule/core/model/job.model';

@Injectable()
export class JobManagementService {
  constructor(private readonly jobRepository: JobRepository) {}
  getAllJobs = async (
    page: number,
    pageSize: number,
    location?: string,
    companyName?: string,
  ): Promise<{ jobs: JobModel[]; total: number }> => {
    const filters: Record<string, any> = {};
    if (location) {
      filters['location'] = location;
    }
    if (companyName) {
      filters['company'] = companyName;
    }
    return await this.jobRepository.findAll(filters, page, pageSize);
  };

  createJob = async (data: CreateJobRequestDto): Promise<JobModel> => {
    const newJob = JobModel.create(data);
    return await this.jobRepository.save(newJob);
  };
}
