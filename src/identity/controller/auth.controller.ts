import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SignInRequestDto } from '../dto/request/sign-in-request.dto';
import { AuthService } from '../service/authentication.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('sign-in')
  @UsePipes(new ValidationPipe({ transform: true }))
  async signIn(
    @Body() signInRequestDto: SignInRequestDto,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.authService.signIn(signInRequestDto);

    if (!accessToken) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return accessToken;
  }
}
