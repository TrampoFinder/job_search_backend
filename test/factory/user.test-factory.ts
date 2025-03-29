import { faker } from '@faker-js/faker/.';
import { UserModel } from '@identityModule/core/model/user.model';
import * as Factory from 'factory.ts';

export const userFactory = Factory.Sync.makeFactory<UserModel>({
  id: Factory.each(() => faker.string.uuid()),
  firstName: Factory.each(() => faker.string.sample()),
  lastName: Factory.each(() => faker.string.sample()),
  email: Factory.each(() => faker.internet.email()),
  salt: Factory.each(() => faker.string.sample()),
  isActive: Factory.each(() => faker.datatype.boolean()),
  role: 'USER',
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
  recoveryCode: null,
  recoveryCodeExpiredAt: null,
  password: Factory.each(() => faker.internet.password()),
});
