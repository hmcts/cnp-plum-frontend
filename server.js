
const appInsights = require('applicationinsights');
const express = require('express');
const path = require('path');
const { Logger } = require('@hmcts/nodejs-logging');
const { APPINSIGHTS_INSTRUMENTATIONKEY } = process.env;

const index = require('./app/index');

const healthCheck = require('@hmcts/nodejs-healthcheck');

let healthConfig = {
    checks: {},
    buildInfo: {
        'cnp-plum': 'cnp-plum-frontend'
    }
};

{/* istanbul ignore next */
    if (APPINSIGHTS_INSTRUMENTATIONKEY !== undefined) {
        appInsights
            .setup(APPINSIGHTS_INSTRUMENTATIONKEY)
            .setAutoDependencyCorrelation(true)
            .setAutoCollectRequests(true)
            .setAutoCollectPerformance(true)
            .setAutoCollectExceptions(true)
            .setAutoCollectDependencies(true)
            .setUseDiskRetryCaching(true)
            .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
            .setSendLiveMetrics(true)
            .start();

        const client = appInsights.defaultClient;
        const PERIOD = 30000; // 30 seconds

        setInterval(() => {
            client.trackEvent({ name: 'ping', properties: { timestamp: Date.now().toString() } });
        }, PERIOD);
    }
}

const app = express();
const appHealth = express();

healthCheck.addTo(appHealth, healthConfig);
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug');
// app.use(Express.accessLogger());
app.use(appHealth);
app.use('/', index);

const logger = Logger.getLogger('server.js');
const port = process.env.PORT || 1337;
const server = app.listen(port, () => {
    logger.info(`Listening on port ${port}`);
});

module.exports = {
    app,
    server
};
