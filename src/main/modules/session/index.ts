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

    // Parse connection string manually to avoid URL-decoding issues.
    // Azure access keys contain characters like +, /, = that new URL() mangles.
    // Format: redis[s]://[user:password@]host[:port]
    const atIndex = redisConnectionString.lastIndexOf('@');
    let rawPassword: string | undefined;
    let hostPort: string;

    if (atIndex > 0) {
      const authPart = redisConnectionString.substring(redisConnectionString.indexOf('://') + 3, atIndex);
      const colonIndex = authPart.indexOf(':');
      rawPassword = colonIndex >= 0 ? authPart.substring(colonIndex + 1) : authPart;
      hostPort = redisConnectionString.substring(atIndex + 1);
    } else {
      hostPort = redisConnectionString.substring(redisConnectionString.indexOf('://') + 3);
    }

    const [host, portStr] = hostPort.split(':');
    const port = parseInt(portStr, 10) || 6380;

    // Enable TLS if scheme is rediss:// OR port is 6380 (Azure Redis TLS port)
    const useTls = redisConnectionString.startsWith('rediss://') || port === 6380;

    this.logger.info(
      `Redis config: host=${host}, port=${port}, tls=${useTls}, passwordLength=${rawPassword?.length || 0}`
    );

    const redis = new Redis({
      host,
      port,
      password: rawPassword || undefined,
      tls: useTls ? { servername: host } : undefined,
      keepAlive: 10000,
      enableReadyCheck: false,
      connectTimeout: 30000,
      retryStrategy: (times: number) => {
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

    redis.on('close', () => {
      this.logger.info('Redis connection closed');
    });

    redis.on('reconnecting', () => {
      this.logger.info(`Redis reconnecting (status: ${redis.status})`);
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
      saveUninitialized: false,
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
