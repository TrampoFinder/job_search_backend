import { randomUUID } from 'crypto';

export const RoleUserType: { [x: string]: 'ADMIN' | 'USER' } = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export type RoleUserType = (typeof RoleUserType)[keyof typeof RoleUserType];

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export class UserModel {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  salt: string;
  isActive: boolean;
  role: RoleUserType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(data: UserModel) {
    Object.assign(this, data);
  }

  static create(
    data: WithOptional<
      UserModel,
      'id' | 'role' | 'isActive' | 'createdAt' | 'updatedAt' | 'deletedAt'
    >,
    id = randomUUID(),
  ): UserModel {
    return new UserModel({
      ...data,
      id,
      role: 'USER',
      isActive: true,
      createdAt: data.createdAt ? data.createdAt : new Date(),
      updatedAt: data.updatedAt ? data.updatedAt : new Date(),
      deletedAt: data.deletedAt ? data.deletedAt : null,
    });
  }
}
