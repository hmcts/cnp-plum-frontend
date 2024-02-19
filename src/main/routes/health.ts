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
          return healthcheck.down({ statusCode: 500 });
        }
      }),
    },
  };
  healthcheck.addTo(app, healthCheckConfig);
