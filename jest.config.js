module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/server/__tests__/setupEnv.ts'],
  testPathIgnorePatterns: ['<rootDir>/server/__tests__/setupEnv.ts'],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'json-summary'],
};
