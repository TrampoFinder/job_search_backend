import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserRequestDto } from '../dto/request/create-user-request.dto';
import { UserManagementService } from '@identityModule/core/service/user-management.service';
import { AlreadyExists } from '@sharedModule/core/exception/already-exists.exception';
import { Response } from 'express';
import { UpdateUserRequestDto } from '../dto/request/update-user-request.dto';
import { NotFoundException } from '@sharedModule/core/exception/not-found.exception';
import { Public } from '@sharedModule/auth/decorator/public.decorator';
import { RequireOwnership } from '@sharedModule/auth/decorator/require-ownership.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(
    @Body() data: CreateUserRequestDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const user = await this.userManagementService.createUser(data);
      return res.status(HttpStatus.CREATED).send({
        message: 'User created successfully',
        statusCode: HttpStatus.CREATED,
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isActive: user.isActive,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          deletedAt: user.deletedAt,
        },
      });
    } catch (error) {
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

  @RequireOwnership('id')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUserById(
    @Param('id') userId: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const user = await this.userManagementService.getUserById(userId);
      return res.status(HttpStatus.OK).send({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
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

  @RequireOwnership('id')
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUserById(
    @Param('id') userId: string,
    @Body() data: UpdateUserRequestDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.userManagementService.updateUser(userId, data);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
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

  @RequireOwnership('id')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteUserById(
    @Param('id') userId: string,
    @Res() res: Response,
  ): Promise<Response> {
    await this.userManagementService.deleteUser(userId);
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
