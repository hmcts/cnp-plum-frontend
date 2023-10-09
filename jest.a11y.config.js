module.exports = {
  roots: ['<rootDir>/src/test/a11y'],
  testRegex: '(/src/test/.*|\\.(test|spec))\\.(ts|js)$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',
  executablePath : "/usr/lib64/chromium-browser/chromium-browser",
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};
