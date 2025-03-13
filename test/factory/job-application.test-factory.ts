import { faker } from '@faker-js/faker/.';
import JobApplicationModel from '@jobManagementModule/core/model/job-application.model';
import * as Factory from 'factory.ts';

export const jobApplicationAppliedFactory =
  Factory.Sync.makeFactory<JobApplicationModel>({
    id: faker.string.uuid(),
    title: faker.string.sample(),
    url: faker.internet.url(),
    userId: faker.string.uuid(),
    jobId: faker.string.uuid(),
    company: faker.company.name(),
    status: 'APPLIED',
    note: faker.word.words(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
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
