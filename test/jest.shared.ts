export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@database/(.*)$': '<rootDir>/database/$1',
    '^@sharedModule/(.*)$': '<rootDir>/src/module/shared/module/$1',
    '^@identityModule/(.*)$': '<rootDir>/src/module/identity/$1',
    '^@jobManagementModule/(.*)$': '<rootDir>/src/module/job-management/$1',
    '^@sharedLibs/(.*)$': '<rootDir>/src/module/shared/$1',
    '^@reportManagementModule/(.*)$':
      '<rootDir>/src/module/report-management/$1',
    '^@testInfra/(.*)$': '<rootDir>/test/$1',
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/test/setup.ts'],
  verbose: true,
  resetMocks: true,
};
