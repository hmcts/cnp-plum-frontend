require('should');
require('should-http');

const request = require('supertest');
const { server } = require('../../server');

describe('GET /status', () => {
  it('respond with json', function (done) {
    request(server)
      .get('/health')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('api');
        server.close();
        done();
      });
  });
});
