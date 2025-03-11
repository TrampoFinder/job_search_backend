import { Injectable } from '@nestjs/common';
import { JobRepository } from '@jobManagementModule/persistence/repository/job.repository';
import { JobNotFoundException } from '@jobManagementModule/core/exception/job-not-found.exception';
import JobApplicationModel from '@jobManagementModule/core/model/job-application.model';
import { CreateJobApplicationRequestDto } from '@jobManagementModule/http/dto/request/create-job-application-request.dto';
import { JobApplicationRepository } from '@jobManagementModule/persistence/repository/job-application.repository';
import { UpdateJobApplicationRequestDto } from '../../http/dto/request/update-job-application-request.dto';

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

  updateJobApplication = async (
    applicationId: string,
    data: UpdateJobApplicationRequestDto,
  ): Promise<JobApplicationModel> => {
    const application = await this.jobApplicationRepository.findByOne({
      id: applicationId,
    });
    if (!application) {
      throw new JobNotFoundException('Job application not found');
    }

    return await this.jobApplicationRepository.update(applicationId, {
      ...application,
      ...data,
    });
  };

  getAllApplicationJobsByUserId = async (
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{
    data: JobApplicationModel[];
    total: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  }> => {
    const getAllApplicationsByUserId =
      await this.jobApplicationRepository.getAllApplicationJobsByUserId(
        userId,
        page,
        pageSize,
      );
    const totalPages = Math.ceil(getAllApplicationsByUserId.total / pageSize);
    const previousPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    return {
      data: getAllApplicationsByUserId.jobApplications,
      total: getAllApplicationsByUserId.total,
      totalPages,
      previousPage,
      nextPage,
    };
  };

  getJobApplications = async (
    page: number,
    pageSize: number,
  ): Promise<{
    data: {
      userId: string;
      fullName: string;
      totalApplications: number;
      activeProcessCount: number;
      statusCount: {
        IN_PROGRESS: number;
        APPROVED: number;
        APPLIED: number;
        REJECTED: number;
        CLOSED: number;
        NOT_PROCESSING: number;
      };
    }[];
    total: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  }> => {
    const getJobApplications =
      await this.jobApplicationRepository.getJobApplications(page, pageSize);
    const totalPages = Math.ceil(getJobApplications.total / pageSize);
    const previousPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    return {
      data: getJobApplications.jobApplications,
      total: getJobApplications.total,
      totalPages,
      previousPage,
      nextPage,
    };
  };
}
