const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const httpTimeout = 60000;

const ensureProtocol = value => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  if (value.startsWith('localhost') || value.startsWith('127.0.0.1')) {
    return `http://${value}`;
  }
  return `https://${value}`;
};

const resolveFrontendUrl = () => {
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

const frontendURL = resolveFrontendUrl();
chai.use(chaiHttp);

//ignore self signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('GET /health', function () {
  this.timeout(httpTimeout);
  it('should return status OK @smoke', function (done) {
    chai
      .request(frontendURL)
      .get('/health')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.status).to.equal('UP');
        done();
      });
  });
});

describe('GET /health/liveness', function () {
  this.timeout(httpTimeout);
  it('should return status OK @smoke', function (done) {
    chai
      .request(frontendURL)
      .get('/health/liveness')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.status).to.equal('UP');
        done();
      });
  });
});
