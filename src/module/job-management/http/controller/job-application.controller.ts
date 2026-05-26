import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateJobApplicationRequestDto } from '../dto/request/create-job-application-request.dto';
import { JobNotFoundException } from '@jobManagementModule/core/exception/job-not-found.exception';
import JobApplicationModel from '@jobManagementModule/core/model/job-application.model';
import { JobApplicationManagementService } from '@jobManagementModule/core/service/job-application-management.service';
import { UpdateJobApplicationRequestDto } from '../dto/request/update-job-application-request.dto';
import { CurrentUser } from '@sharedModule/auth/decorator/current-user.decorator';
import { RequireOwnership } from '@sharedModule/auth/decorator/require-ownership.decorator';

@Controller('job-application')
export class JobApplicationController {
  constructor(
    private readonly jobApplicationManagementService: JobApplicationManagementService,
  ) {}

  @Post('apply/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async applyForJob(
    @Param('id') id: string,
    @Body() data: CreateJobApplicationRequestDto,
    @CurrentUser() user: { id: string; role: string },
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const applyJob = await this.jobApplicationManagementService.applyForJob(
        id,
        user.id,
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

  @Get('history')
  @HttpCode(HttpStatus.OK)
  async getAllApplicationJobsByUserId(
    @CurrentUser() user: { id: string; role: string },
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{
    data: JobApplicationModel[];
    total: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  }> {
    const pageNumber = parseInt(page) || 1;
    const pageSizeNumber = parseInt(pageSize) || 10;
    return await this.jobApplicationManagementService.getAllApplicationJobsByUserId(
      user.id,
      pageNumber,
      pageSizeNumber,
    );
  }

  @RequireOwnership('userId')
  @Put(':userId/:jobId/update')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async updateJobApplication(
    @Param('jobId') jobId: string,
    @Body() data: UpdateJobApplicationRequestDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const updatedJobApplication =
        await this.jobApplicationManagementService.updateJobApplication(
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
