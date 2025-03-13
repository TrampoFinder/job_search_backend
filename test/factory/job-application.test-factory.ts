import { faker } from '@faker-js/faker/.';
import JobApplicationModel from '@jobManagementModule/core/model/job-application.model';
import * as Factory from 'factory.ts';

export const jobApplicationAppliedFactory =
  Factory.Sync.makeFactory<JobApplicationModel>({
    id: Factory.each(() => faker.string.uuid()),
    title: Factory.each(() => faker.string.sample()),
    url: Factory.each(() => faker.internet.url()),
    userId: Factory.each(() => faker.string.uuid()),
    jobId: Factory.each(() => faker.string.uuid()),
    company: Factory.each(() => faker.company.name()),
    status: 'APPLIED',
    note: Factory.each(() => faker.word.words()),
    createdAt: Factory.each(() => faker.date.past()),
    updatedAt: Factory.each(() => faker.date.recent()),
    deletedAt: null,
  });

export const jobApplicationRejectFactory =
  Factory.Sync.makeFactory<JobApplicationModel>({
    id: faker.string.uuid(),
    title: faker.string.sample(),
    url: faker.internet.url(),
    userId: faker.string.uuid(),
    jobId: faker.string.uuid(),
    company: faker.company.name(),
    status: 'REJECTED',
    note: faker.word.words(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    deletedAt: null,
  });
