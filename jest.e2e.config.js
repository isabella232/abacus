module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['<rootDir>/e2e/**/?(*.)+(spec|test).(ts|js)?(x)'],
  testTimeout: 120000,
}
