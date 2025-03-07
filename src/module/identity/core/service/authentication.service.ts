import { Injectable } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import crypto from 'crypto';

import { SignInRequestDto } from '@identityModule/http/rest/dto/request/sign-in-request.dto';
import { UserRepository } from '@identityModule/persistence/repository/user.repository';
import { UnauthorizedException } from '@sharedModule/core/exception/unauthorized.exception';
import { ConfigService } from '@sharedModule/config/service/config.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signIn = async (data: SignInRequestDto): Promise<{ accessToken: string }> => {
    const { email, password } = data;
    const user = await this.userRepository.findByOne({ email });
    if (!user || !this.comparePassword(password, user.password, user.salt)) {
      throw new UnauthorizedException('Invalid credentials!');
    }
    const payload = { sub: user.id, role: user.role };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        algorithm: 'HS256',
      }),
    };
  };

  validateToken = async (token: string | undefined) => {
    if (token == undefined)
      throw new UnauthorizedException('No token provided');
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('secret').key,
      });
      const user = await this.userRepository.findByOne({ id: payload.sub });
      if (!user) throw new UnauthorizedException('User not found!');
      return { id: user.id, role: user.role };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token signature');
      }
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  };
  private comparePassword(
    password: string,
    actualPassword: string,
    salt: string,
  ) {
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');
    return hashedPassword === actualPassword;
  }
}
