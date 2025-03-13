import knex from 'knex';

export const testDbClient = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  searchPath: ['identity', 'job_management', 'report_management'],
});
