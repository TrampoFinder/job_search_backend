import { Injectable } from '@nestjs/common';
import { JobRepository } from '@jobManagementModule/persistence/repository/job.repository';
import { JobNotFoundException } from '@jobManagementModule/core/exception/job-not-found.exception';
import JobApplicationModel from '@jobManagementModule/core/model/job-application.model';
import { CreateJobApplicationRequestDto } from '@jobManagementModule/http/dto/request/create-job-application-request.dto';
import { JobApplicationRepository } from '@jobManagementModule/persistence/repository/job-application.repository';

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
