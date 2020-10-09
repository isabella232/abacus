// We need to extend off of CRA's test config as it is in charge of babel now.
// This isn't public api but it is stable and we will know straight away if it stops working.
// See /node_modules/react-scripts/scripts/test.js for more info.

process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';
require('react-scripts/config/env');

const path = require('path');
const createJestConfig = require('react-scripts/scripts/utils/createJestConfig');

const defaultCRAJestConfig = createJestConfig(
  relativePath => require.resolve(path.join('react-scripts', relativePath)),
  __dirname, // given that Jest config is in project root
  false
);

module.exports = {
  ...defaultCRAJestConfig,
  collectCoverage: true,
  collectCoverageFrom: [
    // Note: Dot directories (e.g., .storybook) are also excluded automatically.
    '**/*.{ts,tsx}',
    '!**/*stories.tsx',
    '!**/node_modules/**',
    '!<rootDir>/src/App.tsx', // We test these with e2e tests.
    '!<rootDir>/src/react-app-env.d.ts', // We test these with e2e tests.
    '!<rootDir>/src/api/**', // We test these with integration tests.
    '!<rootDir>/src/coverage/**',
    '!<rootDir>/src/e2e/**',
    '!<rootDir>/src/pages/**', // We test these with e2e tests.
    '!<rootDir>/src/pages-real/**', // We test these with e2e tests.
    '!<rootDir>/src/public/**',
    '!<rootDir>/src/Routes.tsx',
    '!<rootDir>/src/styles/**',
    '!<rootDir>/src/test-helpers/**',
    '!<rootDir>/src/__tests__/**',
    '!<rootDir>/templates/**',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
  },
  // Adds special extended assertions to Jest, thus simplifying the tests.
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect', '<rootDir>/src/test-helpers/unit-test-setup.ts'],
  testPathIgnorePatterns: ['/src/__tests__/', '/src/e2e/', '/node_modules/'],
  testTimeout: 180000,
}
