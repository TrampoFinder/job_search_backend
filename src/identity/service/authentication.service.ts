import { UserUnauthorizedException } from '../exception/user-unauthorized.exception';
import { UserRepository } from '../repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';

export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSerivce: JwtService,
  ) {}

  signIn = async (
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> => {
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
