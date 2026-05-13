// better handling of unhandled exceptions
process.on('unhandledRejection', reason => {
  throw reason;
});

const ensureProtocol = (value: string): string => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  if (value.startsWith('localhost') || value.startsWith('127.0.0.1')) {
    return `http://${value}`;
  }
  return `https://${value}`;
};

const resolveTestUrl = (): string => {
  const directUrl =
    process.env.TEST_URL ||
    process.env.FRONTEND_URL ||
    process.env.APP_URL ||
    process.env.SERVICE_URL ||
    process.env.PREVIEW_URL;

  if (directUrl) {
    return ensureProtocol(directUrl);
  }

  const serviceFqdn = process.env.SERVICE_FQDN || process.env.INGRESS_HOST || process.env.APP_FQDN;
  if (serviceFqdn) {
    return `https://${serviceFqdn}`;
  }

  return 'http://localhost:1337';
};

export const config = {
  TEST_URL: resolveTestUrl(),
  TestHeadlessBrowser: process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : true,
  TestSlowMo: 250,
  WaitForTimeout: 10000,

  Gherkin: {
    features: './src/test/functional/features/**/*.feature',
    steps: ['./src/test/steps/common.ts'],
  },
  helpers: {},
};

config.helpers = {
  Playwright: {
    url: config.TEST_URL,
    show: !config.TestHeadlessBrowser,
    browser: 'chromium',
    waitForTimeout: config.WaitForTimeout,
    waitForAction: 1000,
    waitForNavigation: 'networkidle0',
    ignoreHTTPSErrors: true,
  },
};
