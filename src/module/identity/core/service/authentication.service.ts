import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';

import { SignInRequestDto } from '@identityModule/http/rest/dto/request/sign-in-request.dto';
import { UserRepository } from '@identityModule/persistence/repository/user.repository';
import { UserUnauthorizedException } from '@identityModule/core/exception/user-unauthorized.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  signIn = async (data: SignInRequestDto): Promise<{ accessToken: string }> => {
    const { email, password } = data;
    const user = await this.userRepository.findByOne({ email });
    if (!user || !this.comparePassword(password, user.password, user.salt)) {
      throw new UserUnauthorizedException('Invalid credentials!');
    }
    const payload = { sub: user.id, role: user.role };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        algorithm: 'HS256',
      }),
    };
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
