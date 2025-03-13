import { faker } from '@faker-js/faker/.';
import { UserModel } from '@identityModule/core/model/user.model';
import * as Factory from 'factory.ts';

export const userFactory = Factory.Sync.makeFactory<UserModel>({
  id: faker.string.uuid(),
  firstName: faker.string.sample(),
  lastName: faker.string.sample(),
  email: faker.internet.email(),
  salt: faker.string.sample(),
  isActive: faker.datatype.boolean(),
  role: 'USER',
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
  password: faker.internet.password(),
});
