import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateJobApplicationRequestDto } from '../dto/request/create-job-application-request.dto';
import { JobNotFoundException } from '@jobManagementModule/core/exception/job-not-found.exception';
import JobApplicationModel from '@jobManagementModule/core/model/job-application.model';
import { JobApplicationManagementService } from '@jobManagementModule/core/service/job-application-management.service';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { AuthenticatedRequest } from '@sharedModule/integration/interface/authenticate-request.interface';
import { UpdateJobApplicationRequestDto } from '../dto/request/update-job-application-request.dto';

@Controller('job-application')
export class JobApplicationController {
  constructor(
    @Inject(IdentityAuthenticateApi)
    private readonly identityAuthenticateApi: IdentityAuthenticateApi,
    private readonly jobApplicationManagementSerivce: JobApplicationManagementService,
  ) {}
  @Post('apply/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async applyForJob(
    @Param('id') id: string,
    @Body() data: CreateJobApplicationRequestDto,
    @Req() req: AuthenticatedRequest,
    @Res()
    res: Response,
  ): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const authenticatedUser =
        await this.identityAuthenticateApi.authenticate(token);
      const applyJob = await this.jobApplicationManagementSerivce.applyForJob(
        id,
        authenticatedUser.id,
        data,
      );

      return res.status(HttpStatus.CREATED).send(applyJob);
    } catch (error) {
      if (error instanceof JobNotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
        });
      }
      throw error;
    }
  }
  @Get(':userId/history')
  @HttpCode(HttpStatus.OK)
  async getAllApplicationJobsByUserId(
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{
    data: JobApplicationModel[];
    total: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  }> {
    const token = req.headers.authorization?.split(' ')[1];
    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 10;
    const userAuthenticated =
      await this.identityAuthenticateApi.authenticate(token);
    await this.identityAuthenticateApi.hasPermission(userAuthenticated, userId);
    const jobApplications =
      await this.jobApplicationManagementSerivce.getAllApplicationJobsByUserId(
        userId,
        pageNumber,
        pageSizeNumber,
      );

    return jobApplications;
  }
  @Put(':userId/:jobId/update')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async updateJobApplication(
    @Param('userId') userId: string,
    @Param('jobId') jobId: string,
    @Body() data: UpdateJobApplicationRequestDto,
    @Req() req: AuthenticatedRequest,
    @Res()
    res: Response,
  ): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const userAuthenticated =
        await this.identityAuthenticateApi.authenticate(token);
      await this.identityAuthenticateApi.hasPermission(
        userAuthenticated,
        userId,
      );
      const updatedJobApplication =
        await this.jobApplicationManagementSerivce.updateJobApplication(
          jobId,
          data,
        );
      return res.status(HttpStatus.OK).send(updatedJobApplication);
    } catch (error) {
      if (error instanceof JobNotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
        });
      }
      throw error;
    }
  }
}
