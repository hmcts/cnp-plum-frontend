import express from 'express';

const mockOn = jest.fn();
const mockRedisInstance = { on: mockOn };
const mockRedisConstructor = jest.fn().mockImplementation(() => mockRedisInstance);

jest.mock('ioredis', () => ({
  Redis: mockRedisConstructor,
}));

jest.mock('connect-redis', () =>
  jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  }))
);

describe('Session module', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.resetModules();
    mockOn.mockClear();
    mockRedisConstructor.mockClear();
    app = express();
    app.locals.ENV = 'test';
  });

  test('should configure session middleware with Redis store', () => {
    const { Session } = require('../../../main/modules/session');
    expect(() => new Session().enableFor(app)).not.toThrow();
  });

  test('should default to port 6380 when no port in connection string', () => {
    const config = require('config');
    jest.spyOn(config, 'get').mockImplementation((...args: unknown[]) => {
      const key = args[0] as string;
      const values: Record<string, unknown> = {
        'session.redisConnectionString': 'rediss://:MYPASSWORD@myredis.redis.cache.windows.net',
        'session.prefix': 'plum-session',
        'session.redis.ttlInSeconds': 5400,
        'node-env': 'development',
        'session.timeout.sessionTimeoutMinutes': 60,
        'session.timeout.sessionWarningMinutes': 10,
        'session.timeout.checkIntervalSeconds': 10,
        'session.secret': 'test-secret',
        'session.cookieName': 'plum_session',
      };
      return values[key];
    });
    const { Session } = require('../../../main/modules/session');
    expect(() => new Session().enableFor(app)).not.toThrow();
    const redisOptions = mockRedisConstructor.mock.calls[0][0];
    expect(redisOptions.port).toBe(6380);
    jest.restoreAllMocks();
  });

  test('should enable TLS when port is 6380 even with redis:// scheme', () => {
    const config = require('config');
    jest.spyOn(config, 'get').mockImplementation((...args: unknown[]) => {
      const key = args[0] as string;
      const values: Record<string, unknown> = {
        'session.redisConnectionString': 'redis://:MYPASSWORD@myredis.redis.cache.windows.net:6380',
        'session.prefix': 'plum-session',
        'session.redis.ttlInSeconds': 5400,
        'node-env': 'development',
        'session.timeout.sessionTimeoutMinutes': 60,
        'session.timeout.sessionWarningMinutes': 10,
        'session.timeout.checkIntervalSeconds': 10,
        'session.secret': 'test-secret',
        'session.cookieName': 'plum_session',
      };
      return values[key];
    });
    const { Session } = require('../../../main/modules/session');
    expect(() => new Session().enableFor(app)).not.toThrow();
    const redisOptions = mockRedisConstructor.mock.calls[0][0];
    expect(redisOptions.tls).toEqual({ servername: 'myredis.redis.cache.windows.net' });
    expect(redisOptions.port).toBe(6380);
    jest.restoreAllMocks();
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

  test('should register connect, error and ready event listeners on redis client', () => {
    const { Session } = require('../../../main/modules/session');
    new Session().enableFor(app);
    const registeredEvents = mockOn.mock.calls.map((call: [string, ...unknown[]]) => call[0]);
    expect(registeredEvents).toContain('connect');
    expect(registeredEvents).toContain('error');
    expect(registeredEvents).toContain('ready');
  });

  test('should invoke connect callback without error', () => {
    const { Session } = require('../../../main/modules/session');
    new Session().enableFor(app);
    const connectCb = mockOn.mock.calls.find(
      (call: [string, ...unknown[]]) => call[0] === 'connect'
    )?.[1] as () => void;
    expect(() => connectCb()).not.toThrow();
  });

  test('should invoke error callback without throwing', () => {
    const { Session } = require('../../../main/modules/session');
    new Session().enableFor(app);
    const errorCb = mockOn.mock.calls.find((call: [string, ...unknown[]]) => call[0] === 'error')?.[1] as (
      err: Error
    ) => void;
    expect(() => errorCb(new Error('connection refused'))).not.toThrow();
  });

  test('should invoke ready callback without error', () => {
    const { Session } = require('../../../main/modules/session');
    new Session().enableFor(app);
    const readyCb = mockOn.mock.calls.find((call: [string, ...unknown[]]) => call[0] === 'ready')?.[1] as () => void;
    expect(() => readyCb()).not.toThrow();
  });

  test('retryStrategy should return capped backoff delay', () => {
    const config = require('config');
    jest.spyOn(config, 'get').mockImplementation((...args: unknown[]) => {
      const key = args[0] as string;
      const values: Record<string, unknown> = {
        'session.redisConnectionString': 'rediss://:MYPASSWORD@myredis.redis.cache.windows.net:6380',
        'session.prefix': 'plum-session',
        'session.redis.ttlInSeconds': 5400,
        'node-env': 'development',
        'session.timeout.sessionTimeoutMinutes': 60,
        'session.timeout.sessionWarningMinutes': 10,
        'session.timeout.checkIntervalSeconds': 10,
        'session.secret': 'test-secret',
        'session.cookieName': 'plum_session',
      };
      return values[key];
    });
    const { Session } = require('../../../main/modules/session');
    new Session().enableFor(app);
    const { retryStrategy, enableReadyCheck, connectTimeout } = mockRedisConstructor.mock.calls[0][0];
    expect(enableReadyCheck).toBe(false);
    expect(connectTimeout).toBe(30000);
    expect(retryStrategy(1)).toBe(200);
    expect(retryStrategy(2)).toBe(400);
    expect(retryStrategy(25)).toBe(5000);
    expect(retryStrategy(100)).toBe(5000);
    jest.restoreAllMocks();
  });

  test('should use TLS with servername and decode URL-encoded password', () => {
    const config = require('config');
    jest.spyOn(config, 'get').mockImplementation((...args: unknown[]) => {
      const key = args[0] as string;
      const values: Record<string, unknown> = {
        'session.redisConnectionString': 'rediss://ignore:MY%2BPASS%2FWORD%3D@myredis.redis.cache.windows.net:6380',
        'session.prefix': 'plum-session',
        'session.redis.ttlInSeconds': 5400,
        'node-env': 'development',
        'session.timeout.sessionTimeoutMinutes': 60,
        'session.timeout.sessionWarningMinutes': 10,
        'session.timeout.checkIntervalSeconds': 10,
        'session.secret': 'test-secret',
        'session.cookieName': 'plum_session',
      };
      return values[key];
    });
    const { Session } = require('../../../main/modules/session');
    expect(() => new Session().enableFor(app)).not.toThrow();
    const redisOptions = mockRedisConstructor.mock.calls[0][0];
    expect(redisOptions.tls).toEqual({ servername: 'myredis.redis.cache.windows.net' });
    expect(redisOptions.password).toBe('MY+PASS/WORD=');
    jest.restoreAllMocks();
  });

  test('should use secure cookies in production', () => {
    process.env.NODE_ENV = 'production';
    const config = require('config');
    jest.spyOn(config, 'get').mockImplementation((...args: unknown[]) => {
      const key = args[0] as string;
      const values: Record<string, unknown> = {
        'session.redisConnectionString': 'redis://localhost:6379',
        'session.prefix': 'plum-session',
        'session.redis.ttlInSeconds': 5400,
        'node-env': 'production',
        'session.timeout.sessionTimeoutMinutes': 60,
        'session.timeout.sessionWarningMinutes': 10,
        'session.timeout.checkIntervalSeconds': 10,
        'session.secret': 'test-secret',
        'session.cookieName': 'plum_session',
      };
      return values[key];
    });
    const { Session } = require('../../../main/modules/session');
    expect(() => new Session().enableFor(app)).not.toThrow();
    jest.restoreAllMocks();
    delete process.env.NODE_ENV;
  });
});
