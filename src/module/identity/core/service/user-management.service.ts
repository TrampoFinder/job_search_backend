import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { UserModel } from '@identityModule/core/model/user.model';
import { NotFoundException } from '@sharedModule/core/exception/not-found.exception';
import { UserRepository } from '@identityModule/persistence/repository/user.repository';
import { CreateUserRequestDto } from '@identityModule/http/rest/dto/request/create-user-request.dto';
import { UpdateUserRequestDto } from '@identityModule/http/rest/dto/request/update-user-request.dto';
import { AlreadyExists } from '@sharedModule/core/exception/already-exists.exception';

export const PASSWORD_HASH_SALT = crypto.randomBytes(20).toString('hex');

@Injectable()
export class UserManagementService {
  constructor(private readonly userRepository: UserRepository) {}
  createUser = async (data: CreateUserRequestDto): Promise<UserModel> => {
    const emailExists = await this.userRepository.findByEmail(data.email);
    if (emailExists) throw new AlreadyExists('Email already in use!');
    const password = this.hashPassword(data.password);
    const newUser = UserModel.create({
      ...data,
      password,
      salt: PASSWORD_HASH_SALT,
    });
    return await this.userRepository.save(newUser);
  };

  getUserById = async (userId: string): Promise<UserModel> => {
    const user = await this.userRepository.findByOne({
      id: userId,
    });
    if (!user) throw new NotFoundException('User not found!');
    return user;
  };

  updateUser = async (
    userId: string,
    data: UpdateUserRequestDto,
  ): Promise<UserModel> => {
    const user = await this.userRepository.findByOne({ id: userId });
    if (!user) throw new NotFoundException('User not found!');
    const emailExists = await this.userRepository.findByEmail(data.email);
    if (emailExists) throw new AlreadyExists('Email already in use!');
    const newPassword = data.password
      ? this.hashPassword(data.password)
      : user.password;
    return await this.userRepository.update(userId, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: newPassword,
      salt: PASSWORD_HASH_SALT,
    });
  };

  deleteUser = async (userId: string): Promise<void> => {
    const user = await this.userRepository.findByOne({ id: userId });
    if (!user) throw new NotFoundException('User not found!');
    await this.userRepository.delete(userId);
  };

  private hashPassword = (password: string) => {
    return crypto
      .pbkdf2Sync(password, PASSWORD_HASH_SALT, 100000, 64, 'sha512')
      .toString('hex');
  };
}
