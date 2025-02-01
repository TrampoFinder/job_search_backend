import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserRequestDto } from '../dto/request/create-user-request.dto';
import { UserManagementService } from '../service/user-management.service';
import { AuthGuard } from '../guard/auth.guard';
import { UserResponseDto } from '../dto/response/user-response.dto';
import { RestResponseInterceptor } from '@src/job-management/interceptor/rest-response.interceptor';

@Controller('user')
export class UserController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new RestResponseInterceptor(UserResponseDto))
  async createUser(data: CreateUserRequestDto): Promise<UserResponseDto> {
    const user = await this.userManagementService.createUser(data);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(new RestResponseInterceptor(UserResponseDto))
  async getUserById(@Param('id') userId: string): Promise<UserResponseDto> {
    const user = await this.userManagementService.getUserById(userId);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
