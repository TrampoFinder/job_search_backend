import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SignInRequestDto } from '../dto/request/sign-in-request.dto';
import { AuthService } from '@identityModule/core/service/authentication.service';
import { UnauthorizedException } from '@sharedModule/core/exception/unauthorized.exception';
import { Response } from 'express';
import { RecoveryPasswordDto } from '../dto/request/recovery-password-request.dto';
import { ResetPasswordDto } from '../dto/request/reset-password-request.dto';
import { Public } from '@sharedModule/auth/decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('sign-in')
  @UsePipes(new ValidationPipe({ transform: true }))
  async signIn(
    @Body() signInRequestDto: SignInRequestDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const accessToken = await this.authService.signIn(signInRequestDto);

      if (!accessToken) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return res.status(HttpStatus.OK).send(accessToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return res.status(HttpStatus.UNAUTHORIZED).send({
          message: error.message,
          statusCode: HttpStatus.UNAUTHORIZED,
          error: 'Unauthorized',
        });
      }
      throw error;
    }
  }
  @Public()
  @Post('/recovery-password')
  async recoveryPassword(
    @Body() recoveryPasswordDto: RecoveryPasswordDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.authService.recoveryPassword(recoveryPasswordDto.email);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      throw error;
    }
  }
  @Public()
  @Post('/reset-password/:token')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res() res: Response,
    @Param('token') token: string,
  ): Promise<Response> {
    try {
      await this.authService.resetPassword(
        token,
        resetPasswordDto.recoveryCode,
        resetPasswordDto.password,
      );
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      throw error;
    }
  }
}
