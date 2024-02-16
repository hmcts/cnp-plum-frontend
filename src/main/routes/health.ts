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

  app.get('http://localhost:1337/health/readiness', async (req, res) => {
    try {
      const response = await axios.get(`${recipesUrl}/health/readiness`);
      if (response.status === 200) {
        res.status(200).json({ status: 'Backend UP' });
      } else {
        res.status(500).json({ status: 'Backend DOWN' });
      }
    } catch (error) {
      res.status(500).json({ status: 'Backend DOWN' });
    }
  });

  app.get('http://localhost:1337/health/liveness', (req, res) => {
    res.status(200).json({ status: 'Alive' });
  });
}
