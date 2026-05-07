import config from 'config';
import { Application, Request } from 'express';

const { Logger } = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('home.ts');

const recipesUrl = config.get('backendUrl');

interface SessionWithVisit extends Request {
  session: Request['session'] & { visitCount?: number };
}

interface RedisProbeClient {
  status: string;
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

        if (redisClient.status !== 'ready') {
          res.status(503).json({ redis: 'unavailable', reason: `Redis not ready (status: ${redisClient.status})`, status: redisClient.status });
          return;
        }
        const key = `plum-session-test:${Date.now()}`;
        try {
          await withTimeout(redisClient.set(key, '1', 'EX', 120), 5000);
          const value = await withTimeout(redisClient.get(key), 5000);
          res.status(200).json({ redis: value === '1' ? 'ok' : 'failed', key, status: redisClient.status });
          return;
        } catch (error) {
          logger.error(error.stack || error);
          res.status(503).json({ redis: 'unavailable', reason: error.message, status: redisClient.status });
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
