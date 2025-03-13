import { faker } from '@faker-js/faker/.';
import JobModel from '@jobManagementModule/core/model/job.model';
import * as Factory from 'factory.ts';

export const jobFactory = Factory.Sync.makeFactory<JobModel>({
  id: Factory.each(() => faker.string.uuid()),
  title: Factory.each(() => faker.string.sample()),
  company: Factory.each(() => faker.company.name()),
  status: 'ACTIVE',
  url: Factory.each(() => faker.internet.url()),
  location: 'REMOTO',
  createdAt: Factory.each(() => faker.date.past()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
});
