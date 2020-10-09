// We need to extend off of CRA's test config as it is in charge of babel now.
// This isn't public api but it is stable and we will know straight away if it stops working.
// See /node_modules/react-scripts/scripts/test.js for more info.

process.env.BABEL_ENV = 'test'
process.env.NODE_ENV = 'test'
process.env.PUBLIC_URL = ''
require('react-scripts/config/env')

const path = require('path')
const createJestConfig = require('react-scripts/scripts/utils/createJestConfig')

const defaultCRAJestConfig = createJestConfig(
  (relativePath) => require.resolve(path.join('react-scripts', relativePath)),
  __dirname, // given that Jest config is in project root
  false,
)

module.exports = {
  ...defaultCRAJestConfig,
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/api/**/*.ts',
    '!<rootDir>/src/api/**/*.test.ts',
    '!**/node_modules/**',
    // FIXME: TODO: Get tests on the following. This is related to issues 52 and 64.
    // Currently we are unable to test the following because the code won't hit the
    // code branch that leads to this error being thrown. If we test against the
    // production API or a more sophisticated mock, then we may be able.
    '!<rootDir>/src/api/UnauthorizedError.ts',
    '!<rootDir>/srv/test-helpers/**',
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
  setupFilesAfterEnv: ['isomorphic-fetch'],
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).ts?(x)'],
  testTimeout: 120000,
}
