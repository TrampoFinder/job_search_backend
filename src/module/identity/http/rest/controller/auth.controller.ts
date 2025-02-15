import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SignInRequestDto } from '../dto/request/sign-in-request.dto';
import { AuthService } from '@identityModule/core/service/authentication.service';
import { UserUnauthorizedException } from '@src/module/identity/core/exception/user-unauthorized.exception';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('sign-in')
  @UsePipes(new ValidationPipe({ transform: true }))
  async signIn(
    @Body() signInRequestDto: SignInRequestDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const accessToken = await this.authService.signIn(signInRequestDto);

      if (!accessToken) {
        throw new UserUnauthorizedException('Invalid credentials');
      }
      return res.status(HttpStatus.OK).send(accessToken);
    } catch (error) {
      if (error instanceof UserUnauthorizedException) {
        return res.status(HttpStatus.UNAUTHORIZED).send({
          message: error.message,
          statusCode: HttpStatus.UNAUTHORIZED,
          error: 'Unauthorized',
        });
      }
      throw error;
    }
  }
}
