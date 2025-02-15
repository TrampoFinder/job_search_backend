import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserRequestDto } from '../dto/request/create-user-request.dto';
import { UserResponseDto } from '../dto/response/user-response.dto';
import { UserManagementService } from '@identityModule/core/service/user-management.service';
import { AuthGuard } from '@identityModule/http/rest/guard/auth.guard';
import { EmailAlreadyExists } from '@src/module/identity/core/exception/email-already-exists.exception';
import { Response } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Post('register')
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
      if (error instanceof EmailAlreadyExists) {
        return res.status(HttpStatus.CONFLICT).send({
          message: error.message,
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
        });
      }
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUserById(@Param('id') userId: string): Promise<UserResponseDto> {
    const user = await this.userManagementService.getUserById(userId);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
