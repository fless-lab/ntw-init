module.exports = {
  displayName: 'demo-app',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './',
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../../$1',
  },
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'services/**/*.ts',
    'controllers/**/*.ts',
    'repositories/**/*.ts',
  ],
};
