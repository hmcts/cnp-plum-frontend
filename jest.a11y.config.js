module.exports = {
  roots: ['<rootDir>/src/test/a11y'],
  testRegex: '(/src/test/.*|\\.(test|spec))\\.(ts|js)$',
  testPathIgnorePatterns: ['/node_modules/', '/src/test/a11y/mocks/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^ioredis$': '<rootDir>/src/test/a11y/mocks/ioredis.ts',
  },
};
