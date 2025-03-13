import { JwtService } from '@nestjs/jwt';
import { testDbClient } from '@testInfra/knex.database';
import { UnauthorizedException } from '@nestjs/common';
import { Tables } from '@testInfra/enum/tables.enum';

export const signInFactory = async (email: string, password: string) => {
  const jwtService = new JwtService();
  const user = await testDbClient(Tables.identity_tb_users)
    .where({ email })
    .first();
  if (!user || password !== user.password) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const payload = { sub: user.id, role: user.role };
  const accessToken = await jwtService.signAsync(payload, {
    privateKey: process.env.SECRET_KEY,
    algorithm: 'HS256',
    expiresIn: '1h',
  });

  return { accessToken };
};
