var request = require('supertest');
var app = require('../app.js');

describe('GET /tickets should respond with an empty list of tickets', function() {
  it('respond with json', function(done) {
    request(app)
      .get('/tickets')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect([], done);
  });
});
