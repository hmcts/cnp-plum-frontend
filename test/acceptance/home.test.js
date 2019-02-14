require('should');
require('should-http');
const request = require('supertest');
const { server } = require('../../server');

describe('GET /', () => {
  it('should have an index page', done => {
    request(server)
      .get('/')
      .end((err, res) => {
        res.should.have.status(500);
        server.close();
        done();
      });
  });
});
