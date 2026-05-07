import config from 'config';
import { Application, Request } from 'express';

const { Logger } = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('home.ts');

const recipesUrl = config.get('backendUrl');

interface SessionWithVisit extends Request {
  session: Request['session'] & { visitCount?: number };
}

export default function (app: Application): void {
  app.get('/', async (req: SessionWithVisit, res) => {
    const url = `${recipesUrl}/recipes`;
    try {
      if (req.query.sessionTest === 'true') {
        req.session.visitCount = (req.session.visitCount ?? 0) + 1;
      }
      const { recipes } = await fetch(url).then(fetchRes => fetchRes.json());
      return res.render('home', { recipes });
    } catch (err) {
      logger.error(err.stack);
      res.status(500).end();
    }
  });
}
