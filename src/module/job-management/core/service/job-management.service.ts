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
  ): Promise<{
    data: JobModel[];
    total: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  }> => {
    const filters: Record<string, any> = {};
    if (location) {
      filters['location'] = location;
    }
    if (companyName) {
      filters['company'] = companyName;
    }
    const getJobs = await this.jobRepository.findAll(filters, page, pageSize);
    const totalPages = Math.ceil(getJobs.total / pageSize);
    const previousPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    return {
      data: getJobs.jobs,
      total: getJobs.total,
      totalPages,
      previousPage,
      nextPage,
    };
  };

  createJob = async (data: CreateJobRequestDto): Promise<JobModel> => {
    const newJob = JobModel.create(data);
    return await this.jobRepository.save(newJob);
  };

  getJobsByCompanyCount = async (): Promise<number> => {
    return await this.jobRepository.findByCompanyCount();
  };
}
