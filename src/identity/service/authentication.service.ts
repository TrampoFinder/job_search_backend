import { Injectable } from '@nestjs/common';
import { SignInRequestDto } from '../dto/request/sign-in-request.dto';
import { UserUnauthorizedException } from '../exception/user-unauthorized.exception';
import { UserRepository } from '../repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSerivce: JwtService,
  ) {}

  signIn = async (data: SignInRequestDto): Promise<{ accessToken: string }> => {
    const { email, password } = data;
    const user = await this.userRepository.findByOne({ email });
    if (!user || !this.comparePassword(password, user.password, user.salt)) {
      throw new UserUnauthorizedException('Invalid credentials!');
    }
    const payload = { sub: user.id };
    return {
      accessToken: await this.jwtSerivce.signAsync(payload, {
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
