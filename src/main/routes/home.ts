import config from 'config';
import { Application } from 'express';

const { Logger } = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('home.ts');

const recipesUrl = config.get('backendUrl');

export default function (app: Application): void {
  app.get('/', async (req, res) => {
    const url = `${recipesUrl}/recipes`;
    try {
      const { recipes } = await fetch(url).then(fetchRes => fetchRes.json());
      return res.render('home', { recipes });
    } catch (err) {
      logger.error(err.stack);
      return res.status(500).render('error', { message: 'Problem communicating with the backend' });
    }
  });
}
