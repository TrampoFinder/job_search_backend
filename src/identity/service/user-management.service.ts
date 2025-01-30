import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { UserRepository } from '../repository/user.repository';
import { UserModel } from '../model/user.model';
import { CreateUserRequestDto } from '../dto/request/create-user-request.dto';
import { UserNotFoundException } from '../exception/user-not-found.exception';

export const PASSWORD_HASH_SALT = crypto.randomBytes(20).toString('hex');

@Injectable()
export class UserManagementService {
  constructor(private readonly userRepository: UserRepository) {}
  createUser = async (data: CreateUserRequestDto): Promise<UserModel> => {
    const password = crypto
      .pbkdf2Sync(data.password, PASSWORD_HASH_SALT, 100000, 64, 'sha512')
      .toString('hex');

    const newUser = UserModel.create({
      ...data,
      password,
      salt: PASSWORD_HASH_SALT,
    });
    return await this.userRepository.save(newUser);
  };

  getUserById = async (id: string): Promise<UserModel> => {
    const user = await this.userRepository.findByOne({ id });
    if (!user) throw new UserNotFoundException('User not found!');
    return user;
  };
}
