import { Injectable } from '@nestjs/common';
import { JobApplicationApi } from '@sharedModule/integration/interface/job-application-integration.interface';
import { JobApplicationManagementService } from '../../core/service/job-application-management.service';

@Injectable()
export class JobApplicationPublicApiProvider implements JobApplicationApi {
  constructor(
    private readonly jobApplicationManagementService: JobApplicationManagementService,
  ) {}
  async getJobApplications(page?: number, pageSize?: number) {
    try {
      return this.jobApplicationManagementService.getJobApplications(
        page,
        pageSize,
      );
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get job applications');
    }
  }
}
