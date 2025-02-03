import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JobApplicationManagementService } from '../service/job-application-management.service';
import { JobNotFoundException } from '../exception/job-not-found.exception';
import { Response } from 'express';
import { CreateJobApplicationRequestDto } from '../dto/request/create-job-application-request.dto';
import {
  AuthenticatedRequest,
  AuthGuard,
} from '@src/shared/util/guard/auth.guard';

@Controller('/job-application')
export class JobApplicationController {
  constructor(
    private readonly jobApplicationManagementSerivce: JobApplicationManagementService,
  ) {}
  @Post('/apply/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard)
  async applyForJob(
    @Param('id') jobId: string,
    @Body() data: CreateJobApplicationRequestDto,
    @Req() req: AuthenticatedRequest,
    @Res()
    res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user.id;
      const applyJob = await this.jobApplicationManagementSerivce.applyForJob(
        jobId,
        userId,
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
}
