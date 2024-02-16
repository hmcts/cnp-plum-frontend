import axios from 'axios';
import { Application } from 'express';

const healthcheck = require('@hmcts/nodejs-healthcheck');
export default function (app: Application): void {
  const backendHealthCheckUrl = 'http://plum-recipe-backend-sandbox.service.core-compute-sandbox.internal/health/readiness';

  const checkBackendHealth = async () => {
    try {
      await axios.get(backendHealthCheckUrl);
      return healthcheck.up();
    } catch (error) {
      throw new Error('Backend is down');
    }
  };

  const healthCheckConfig = {
    checks: {
      backendCheck: healthcheck.raw(checkBackendHealth),
      sampleCheck: healthcheck.raw(() => healthcheck.up()),
    },
  };

  healthcheck.addTo(app, healthCheckConfig);
}
