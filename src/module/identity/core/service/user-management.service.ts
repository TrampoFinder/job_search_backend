import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { UserModel } from '@identityModule/core/model/user.model';
import { UserNotFoundException } from '@identityModule/core/exception/user-not-found.exception';
import { UserRepository } from '@identityModule/persistence/repository/user.repository';
import { CreateUserRequestDto } from '@identityModule/http/rest/dto/request/create-user-request.dto';
import { EmailAlreadyExists } from '../exception/email-already-exists.exception';

export const PASSWORD_HASH_SALT = crypto.randomBytes(20).toString('hex');

@Injectable()
export class UserManagementService {
  constructor(private readonly userRepository: UserRepository) {}
  createUser = async (data: CreateUserRequestDto): Promise<UserModel> => {
    const emailExists = await this.userRepository.findByEmail(data.email);
    if (emailExists) throw new EmailAlreadyExists('Email already in use!');
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

  updateUser = async (userId: string, data: any): Promise<UserModel> => {
    const user = await this.userRepository.findByOne({ id: userId });
    const emailExists = await this.userRepository.findByEmail(data.email);
    if (!user) throw new UserNotFoundException('User not found!');
    if (emailExists) throw new EmailAlreadyExists('Email already in use!');
    return await this.userRepository.update(userId, data);
  };

  deleteUser = async (userId: string): Promise<void> => {
    await this.userRepository.delete(userId);
  };
}
