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

export default function (app: Application): void {
  app.get('/', async (req: SessionWithVisit, res) => {
    const url = `${recipesUrl}/recipes`;
    try {
      if (req.query.sessionTest === 'true') {
        const redisClient = req.app.locals.redisClient as RedisProbeClient | undefined;
        if (!redisClient || redisClient.status !== 'ready') {
          return res.status(503).json({ redis: 'unavailable' });
        }

        const key = `plum-session-test:${Date.now()}`;
        await redisClient.set(key, '1', 'EX', 120);
        const value = await redisClient.get(key);
        return res.status(200).json({ redis: value === '1' ? 'ok' : 'failed', key });
      }
      const { recipes } = await fetch(url).then(fetchRes => fetchRes.json());
      return res.render('home', { recipes });
    } catch (err) {
      logger.error(err.stack);
      res.status(500).end();
    }
  });
}
