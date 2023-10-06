const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const httpTimeout = 60000;

// TODO Frontend URL must be retrieve from Vault

const frontendURL = process.env.TEST_URL || 'http://localhost:1337';
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
