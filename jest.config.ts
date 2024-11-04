import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  rootDir: '.',
  // projects: [
  //   '<rootDir>/src/apps/*/jest.config.ts',
  //   '<rootDir>/src/modules/*/jest.config.ts',
  // ],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  coverageDirectory: '<rootDir>/coverage',
  preset: 'ts-jest',
  testEnvironment: 'node',
  // setupFilesAfterEnv: ['<rootDir>/tests/helpers/setup.ts'],
  verbose: true,
};

export default config;
