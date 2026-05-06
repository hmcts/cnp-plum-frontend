import express from 'express';

jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
    })),
  };
});

jest.mock('connect-redis', () =>
  jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  }))
);

describe('Session module', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.locals.ENV = 'test';
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('should configure session middleware with Redis store', () => {
    const { Session } = require('../../../main/modules/session');
    const sessionModule = new Session();

    expect(() => sessionModule.enableFor(app)).not.toThrow();
  });

  test('should attach redisClient to app.locals', () => {
    const { Session } = require('../../../main/modules/session');
    new Session().enableFor(app);

    expect(app.locals.redisClient).toBeDefined();
  });

  test('should set trust proxy on app', () => {
    const { Session } = require('../../../main/modules/session');
    new Session().enableFor(app);

    expect(app.get('trust proxy')).toBe(true);
  });
});
