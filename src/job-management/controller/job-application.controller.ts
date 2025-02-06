import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JobApplicationManagementService } from '../service/job-application-management.service';
import { JobNotFoundException } from '../exception/job-not-found.exception';
import { Response } from 'express';
import { CreateJobApplicationRequestDto } from '../dto/request/create-job-application-request.dto';
import { IdentityAuthenticateApi } from '@src/shared/module/integration/interface/identity-integration.interface';
import { AuthenticatedRequest } from '@src/shared/module/integration/interface/authenticate-request.interface';
import JobApplicationModel from '../model/job-application.model';

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
  ): Promise<JobApplicationModel[]> {
    const token = req.headers.authorization?.split(' ')[1];
    const userAuthenticated =
      await this.identityAuthenticateApi.authenticate(token);
    await this.identityAuthenticateApi.hasPermission(userAuthenticated, userId);
    const jobApplications =
      await this.jobApplicationManagementSerivce.getAllApplicationJobsByUserId(
        userId,
      );

    return jobApplications;
  }
}
