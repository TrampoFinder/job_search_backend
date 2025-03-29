import { Injectable } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import crypto from 'crypto';

import { SignInRequestDto } from '@identityModule/http/rest/dto/request/sign-in-request.dto';
import { UserRepository } from '@identityModule/persistence/repository/user.repository';
import { UnauthorizedException } from '@sharedModule/core/exception/unauthorized.exception';
import { ConfigService } from '@sharedModule/config/service/config.service';
import { PASSWORD_HASH_SALT } from './user-management.service';
import { EmailSenderService } from '@sharedModule/notification/service/email-sender.service';
import { BadRequestException } from '@sharedModule/core/exception/bad-request.exception';
import { NotFoundException } from '@sharedModule/core/exception/not-found.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailSenderService: EmailSenderService,
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
        expiresIn: '1h',
      }),
    };
  };

  recoveryPassword = async (email: string): Promise<void> => {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials!');
    }
    const recoveryToken = crypto.randomBytes(4).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.userRepository.update(user.id, {
      recoveryCode: recoveryToken,
      recoveryCodeExpiredAt: tokenExpiresAt,
    });
    const payload = { sub: user.id };
    const jwtToken = await this.jwtService.signAsync(payload, {
      algorithm: 'HS256',
      expiresIn: '15m',
    });
    const resetPasswordUrl = `${this.configService.get('mailer').apiUrl}/auth/reset-password/${jwtToken}`;
    await this.emailSenderService.sendEmail(
      user.email,
      'TrampoFinder - Recuperação de Senha',
      `
        <body style="font-family: Verdana, Geneva, Tahoma, sans-serif;">
          <p>Prezado usuário TrampoFinder,</p>
          <p>
            Recebemos uma solicitação para recuperação da sua conta
            <strong>${user.email}</strong>.
          </p>
          <p>Seu código de recuperação do TrampoFinder é:</p>
          <div style="
                  display: flex; 
                  justify-content: start; 
                  align-items: center; 
                  background-color: rgba(139, 93, 255, 0.2); 
                  width: 85px; 
                  height: 25px; 
                  border-radius: 4px; 
                  padding: 10px;
                "
            >
            <span style="color: #6a42c2; font-size: 1rem;"><strong>${recoveryToken}</strong></span>
          </div>
          <p>
            Se você não solicitou esse código, é possível que outra pessoa esteja
            tentando acessar a sua conta. Não encaminhe ou dê o código a ninguém.
          </p>

          <p>Para continuar a recuperação da sua conta, clique no botão abaixo:</p>

          <a
            href="${resetPasswordUrl}"
            style="
              display: inline-block;
              padding: 10px 20px;
              background-color:#6a42c2;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
            "
          >
            Recuperar Senha
          </a>
          <p>Atenciosamente,<br />Equipe <strong>TrampoFinder</strong></p>
        </body>
      `,
    );
  };

  resetPassword = async (
    token: string,
    recoveryToken: string,
    password: string,
  ): Promise<void> => {
    const userValidToken = await this.validateToken(token);
    const user = await this.userRepository.findByOne({
      id: userValidToken.id,
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const passwordVerified = this.comparePassword(
      password,
      user.password,
      user.salt,
    );
    if (passwordVerified) {
      throw new BadRequestException(
        'The new password must be different from the previous one.',
      );
    }
    if (user.recoveryCode && user.recoveryCode != recoveryToken) {
      throw new UnauthorizedException('Invalid recovery code.');
    }
    if (user.recoveryCodeExpiredAt && user.recoveryCodeExpiredAt < new Date()) {
      throw new UnauthorizedException('Recovery code has expired.');
    }
    const passwordHashed = crypto
      .pbkdf2Sync(password, PASSWORD_HASH_SALT, 100000, 64, 'sha512')
      .toString('hex');
    await this.userRepository.update(userValidToken.id, {
      recoveryCode: null,
      recoveryCodeExpiredAt: null,
      password: passwordHashed,
      salt: PASSWORD_HASH_SALT,
    });
  };

  validateToken = async (token: string | undefined) => {
    if (token == undefined)
      throw new UnauthorizedException('No token provided');
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('secret').key,
      });
      const user = await this.userRepository.findByOne({ id: payload.sub });
      if (!user) throw new NotFoundException('User not found!');
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
