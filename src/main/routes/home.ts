import config from 'config';
import { Application, Request } from 'express';

const { Logger } = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('home.ts');

const recipesUrl = config.get('backendUrl');

interface SessionWithVisit extends Request {
  session: Request['session'] & { visitCount?: number };
}

interface RedisProbeClient {
  ping: () => Promise<string>;
  set: (key: string, value: string, mode: 'EX', seconds: number) => Promise<unknown>;
  get: (key: string) => Promise<string | null>;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Redis probe timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

export default function (app: Application): void {
  app.get('/', async (req: SessionWithVisit, res): Promise<void> => {
    const url = `${recipesUrl}/recipes`;
    try {
      if (req.query.sessionTest === 'true') {
        const redisClient = req.app.locals.redisClient as RedisProbeClient | undefined;
        if (!redisClient) {
          res.status(503).json({ redis: 'unavailable', reason: 'redis client missing' });
          return;
        }

        try {
          await withTimeout(redisClient.ping(), 5000);
          const key = 'plum-redis-test';
          const testValue = `test-${new Date().toISOString()}`;
          await withTimeout(redisClient.set(key, testValue, 'EX', 300), 5000);
          const value = await withTimeout(redisClient.get(key), 5000);
          if (value === testValue) {
            res.status(200).json({ redis: 'ok', message: 'Redis connection working', key, verified: true });
            return;
          }
          res.status(503).json({ redis: 'failed', reason: 'Key verification failed', key });
          return;
        } catch (error) {
          logger.error(error.stack || error);
          res.status(503).json({ redis: 'unavailable', reason: error.message });
          return;
        }
      }
      const { recipes } = await fetch(url).then(fetchRes => fetchRes.json());
      res.render('home', { recipes });
      return;
    } catch (err) {
      logger.error(err.stack);
      res.status(500).end();
    }
  });
}
