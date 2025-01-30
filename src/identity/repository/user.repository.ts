import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { UserModel } from '../model/user.model';
import { Prisma } from '@prisma/client';

type QueryableFields = Prisma.$UserPayload['scalars'];

@Injectable()
export class UserRepository {
  private readonly model: PrismaService['user'];
  constructor(prismaService: PrismaService) {
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
      return Object.assign(this, user);
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
  async clear(): Promise<{ count: number }> {
    try {
      return await this.model.deleteMany();
    } catch (error) {
      this.handleAndThrowError(error);
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'An unexpected error occurred.';
  }
  protected handleAndThrowError(error: unknown): never {
    const errorMessage = this.extractErrorMessage(error);
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new Error(error.message);
    }

    throw new Error(errorMessage);
  }
}
