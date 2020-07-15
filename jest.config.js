module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  preset: '@shelf/jest-dynamodb',
  setupFiles: ['<rootDir>/src/__tests__/helpers/setUpEnvVars.ts'],
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
  },
};
