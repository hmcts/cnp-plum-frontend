import axios from 'axios';
import config from 'config';
import { Application } from 'express';

const healthcheck = require('@hmcts/nodejs-healthcheck');

const recipesUrl = config.get('backendUrl');

export default function (app: Application): void {
  const healthCheckConfig = {
    checks: {
      backendCheck: healthcheck.raw(async () => {
        try {
          const response = await axios.get(`${recipesUrl}/health/readiness`);
          return response.status === 200 ? healthcheck.up() : healthcheck.down();
        } catch (error) {
          return healthcheck.down();
        }
      }),
    },
  };

  healthcheck.addTo(app, healthCheckConfig);

  app.get('/healthz', async (req, res) => {
    try {
      const response = await axios.get(`${recipesUrl}/health/readiness`);
      if (response.status === 200) {
        res.status(200).send('OK');
      } else {
        res.status(503).send('Backend is Unavailable');
      }
    } catch (error) {
      res.status(503).send('Backend is Unavailable');
    }
  });
}
