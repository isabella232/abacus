module.exports = {
  preset: 'jest-puppeteer',
  setupFiles: ['./test-helpers/jest-setup.ts'],
  testMatch: ['**/e2e/**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
