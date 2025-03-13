import FavoriteJobService from '@jobManagementModule/core/service/favorite-job.service';
import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AlreadyExists } from '@sharedModule/core/exception/already-exists.exception';
import { NotFoundException } from '@sharedModule/core/exception/not-found.exception';
import { AuthenticatedRequest } from '@sharedModule/integration/interface/authenticate-request.interface';
import { IdentityAuthenticateApi } from '@sharedModule/integration/interface/identity-integration.interface';
import { Response } from 'express';
@Controller('favorites-job')
export class FavoriteJobController {
  constructor(
    @Inject(IdentityAuthenticateApi)
    private readonly identityAuthenticateApi: IdentityAuthenticateApi,
    private readonly favoriteJobService: FavoriteJobService,
  ) {}
  @Post(':id')
  async addFavoriteJob(
    @Param('id') jobId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const authenticatedUser =
        await this.identityAuthenticateApi.authenticate(token);
      const favoriteJob = await this.favoriteJobService.addFavoriteJob(
        jobId,
        authenticatedUser.id,
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
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const pageNumber = parseInt(page) || 1;
      const pageSizeNumber = parseInt(pageSize) || 10;
      const authenticatedUser =
        await this.identityAuthenticateApi.authenticate(token);
      const favoriteJobs = await this.favoriteJobService.getFavoriteJobs(
        authenticatedUser.id,
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
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const authenticatedUser =
        await this.identityAuthenticateApi.authenticate(token);
      await this.favoriteJobService.removeFavoriteJob(
        jobId,
        authenticatedUser.id,
      );
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
