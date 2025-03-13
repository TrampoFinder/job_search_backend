import { faker } from '@faker-js/faker/.';
import JobModel from '@jobManagementModule/core/model/job.model';
import * as Factory from 'factory.ts';

export const jobFactory = Factory.Sync.makeFactory<JobModel>({
  id: faker.string.uuid(),
  title: faker.string.sample(),
  company: faker.company.name(),
  status: 'ACTIVE',
  url: faker.internet.url(),
  location: 'REMOTO',
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});
