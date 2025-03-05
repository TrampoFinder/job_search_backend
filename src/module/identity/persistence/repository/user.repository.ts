import { Injectable } from '@nestjs/common';
import { PrismaService } from '@sharedModule/prisma/prisma.service';

import { Prisma } from '@prisma/client';
import { DefaultPrismaRepository } from '@sharedModule/prisma/default.prisma.repository';
import { UserModel } from '@identityModule/core/model/user.model';
type QueryableFields = Prisma.$UserPayload['scalars'];

@Injectable()
export class UserRepository extends DefaultPrismaRepository {
  private readonly model: PrismaService['user'];
  constructor(prismaService: PrismaService) {
    super();
    this.model = prismaService.user;
  }
  findByOne = async (
    fields: Partial<QueryableFields>,
  ): Promise<UserModel | undefined> => {
    try {
      const user = await this.model.findFirst({ where: fields });
      if (!user) {
        return;
      }
      return user;
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  save = async (data: UserModel): Promise<UserModel> => {
    try {
      const user = await this.model.create({ data });
      return user;
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  findByEmail = async (email: string): Promise<UserModel | undefined> => {
    try {
      const user = await this.model.findFirst({ where: { email } });
      if (!user) {
        return;
      }
      return user;
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  update = async (
    userId: string,
    data: Prisma.UserUpdateInput,
  ): Promise<UserModel> => {
    try {
      const updatedUser = await this.model.update({
        where: {
          id: userId,
        },
        data,
      });
      return updatedUser;
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };

  delete = async (userId: string): Promise<UserModel> => {
    try {
      const deletedUser = await this.model.update({
        where: {
          id: userId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
      return deletedUser;
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };
  clear = async (): Promise<{ count: number }> => {
    try {
      return await this.model.deleteMany();
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };
}
