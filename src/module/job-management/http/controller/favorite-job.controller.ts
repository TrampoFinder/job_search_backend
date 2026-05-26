import FavoriteJobService from '@jobManagementModule/core/service/favorite-job.service';
import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AlreadyExists } from '@sharedModule/core/exception/already-exists.exception';
import { NotFoundException } from '@sharedModule/core/exception/not-found.exception';
import { Response } from 'express';
import { CurrentUser } from '@sharedModule/auth/decorator/current-user.decorator';

@Controller('favorites-job')
export class FavoriteJobController {
  constructor(private readonly favoriteJobService: FavoriteJobService) {}

  @Post(':id')
  async addFavoriteJob(
    @Param('id') jobId: string,
    @CurrentUser() user: { id: string; role: string },
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const favoriteJob = await this.favoriteJobService.addFavoriteJob(
        jobId,
        user.id,
      );
      return res.status(HttpStatus.CREATED).send({
        favoriteJob,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
        });
      }
      if (error instanceof AlreadyExists) {
        return res.status(HttpStatus.CONFLICT).send({
          message: error.message,
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
        });
      }
      throw error;
    }
  }

  @Get()
  async getFavoriteJobs(
    @CurrentUser() user: { id: string; role: string },
    @Res() res: Response,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ): Promise<Response> {
    try {
      const pageNumber = parseInt(page) || 1;
      const pageSizeNumber = parseInt(pageSize) || 10;
      const favoriteJobs = await this.favoriteJobService.getFavoriteJobs(
        user.id,
        pageNumber,
        pageSizeNumber,
      );
      return res.status(HttpStatus.OK).send({
        favoriteJobs,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
        });
      }
      throw error;
    }
  }

  @Delete(':id/remove')
  async removeFavoriteJob(
    @Param('id') jobId: string,
    @CurrentUser() user: { id: string; role: string },
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.favoriteJobService.removeFavoriteJob(jobId, user.id);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      if (error instanceof NotFoundException) {
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
