import config from 'config';
import RedisStore from 'connect-redis';
import type { Express } from 'express';
import session from 'express-session';
import { Redis } from 'ioredis';

const { Logger } = require('@hmcts/nodejs-logging');

export class Session {
  logger = Logger.getLogger('session');

  enableFor(app: Express): void {
    const redisConnectionString = config.get<string>('session.redisConnectionString');
    this.logger.info('Connecting to Azure Cache for Redis');

    // Azure Cache for Redis does not support username-based AUTH.
    // Parse the connection string and pass credentials as explicit options
    // so ioredis sends single-arg AUTH (password only) instead of AUTH user password.
    const redisUrl = new URL(redisConnectionString);
    const redis = new Redis({
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port, 10) || 6380,
      password: redisUrl.password || redisUrl.username || undefined,
      tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
      keepAlive: 10000,
      retryStrategy: (times: number) => {
        if (times > 20) {
          this.logger.error('Redis connection failed after 20 retries, giving up');
          return null;
        }
        return Math.min(times * 200, 5000);
      },
    });

    redis.on('connect', () => {
      this.logger.info('Successfully connected to Azure Cache for Redis');
    });

    redis.on('error', (err: typeof Error) => {
      this.logger.error('REDIS ERROR:', err);
    });

    redis.on('ready', () => {
      this.logger.info('Redis client is ready');
    });

    app.locals.redisClient = redis;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const redisStore = new (RedisStore as any)({
      client: redis,
      prefix: config.get('session.prefix') + ':',
      ttl: config.get('session.redis.ttlInSeconds'),
    });

    const secure = config.get<string>('node-env').toLowerCase() === 'production';

    const sessionTimeoutMinutes = config.get<number>('session.timeout.sessionTimeoutMinutes');
    const sessionWarningMinutes = config.get<number>('session.timeout.sessionWarningMinutes');
    const checkIntervalSeconds = config.get<number>('session.timeout.checkIntervalSeconds');

    const sessionMiddleware: session.SessionOptions = {
      secret: config.get<string>('session.secret'),
      resave: false,
      saveUninitialized: true,
      rolling: true,
      cookie: {
        sameSite: secure ? 'strict' : 'lax',
        secure,
        maxAge: sessionTimeoutMinutes * 60 * 1000,
      },
      name: config.get<string>('session.cookieName'),
      store: redisStore,
    };

    app.set('trust proxy', true);
    app.use(session(sessionMiddleware));

    // Make timeout config available to templates
    app.locals.nunjucksEnv?.addGlobal('sessionTimeout', {
      sessionWarningMinutes,
      sessionTimeoutMinutes,
      checkIntervalSeconds,
    });

    this.logger.info('Session middleware configured with Azure Cache for Redis store');
    this.logger.info(
      `Session timeout: ${sessionTimeoutMinutes} minutes, warning at ${sessionWarningMinutes} minutes before expiry`
    );
  }
}
