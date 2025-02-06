import { Injectable } from '@nestjs/common';

import { JobRepository } from '@src/job-management/repository/job.repository';
import { JobNotFoundException } from '../exception/job-not-found.exception';
import { JobApplicationRepository } from '../repository/job-application.repository';
import { CreateJobApplicationRequestDto } from '../dto/request/create-job-application-request.dto';
import JobApplicationModel from '../model/job-application.model';

@Injectable()
export class JobApplicationManagementService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly jobApplicationRepository: JobApplicationRepository,
  ) {}
  applyForJob = async (
    jobId: string,
    userId: string,
    data: CreateJobApplicationRequestDto,
  ): Promise<JobApplicationModel> => {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new JobNotFoundException('Job not found');
    }
    const newApplicationJob = JobApplicationModel.create({
      ...data,
      userId: userId,
      jobId: jobId,
    });
    return await this.jobApplicationRepository.save(newApplicationJob);
  };

  getAllApplicationJobsByUserId = async (
    userId: string,
  ): Promise<JobApplicationModel[]> => {
    return await this.jobApplicationRepository.getAllApplicationJobs(userId);
  };
}
