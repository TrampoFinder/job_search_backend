import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/shared/module/prisma/prisma.service';
import { UserModel } from '../model/user.model';
import { Prisma } from '@prisma/client';
import { DefaultPrismaRepository } from '@src/shared/module/prisma/default.prisma.repository';

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
  clear = async (): Promise<{ count: number }> => {
    try {
      return await this.model.deleteMany();
    } catch (error) {
      this.handleAndThrowError(error);
    }
  };
}
