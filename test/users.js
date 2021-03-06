const chai = require('chai'),
  server = require('./../app'),
  sessionManager = require('./../app/services/sessionManager'),
  should = chai.should();

const successfulLogin = (cb) => {
  chai.request(server)
    .get('/login?username=username1&password=1234')
    .end((err, res) => {
      if (cb) {
        cb(err, res);
      }
    });
}

describe('users', () => {
  describe('/login GET', () => {
    it('should fail login because of invalid username', (done) => {
      chai.request(server)
        .get('/login?username=invalid&password=1234')
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('error');
          done();
        });
    });

    it('should fail login because of invalid password', (done) => {
      chai.request(server)
        .get('/login?username=username1&password=invalid')
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('error');
          done();
        });
    });

    it('should be successful', (done) => {
      successfulLogin((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.have.property('firstName');
        res.body.should.have.property('lastName');
        res.body.should.have.property('username');
        res.body.should.have.property('email');
        res.body.should.have.property('password');
        res.headers.should.have.property(sessionManager.HEADER_NAME);
        done();
      });
    });
  })

  describe('/logout POST', () => {
    it(`should fail because ${sessionManager.HEADER_NAME} header is not being sent`, (done) => {
      chai.request(server)
        .post('/logout')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should be successful', (done) => {
      successfulLogin((loginErr, loginRes) => {
        chai.request(server)
          .post('/logout')
          .set(sessionManager.HEADER_NAME, loginRes.headers[sessionManager.HEADER_NAME])
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
    });
  })

  describe('/users/me GET', () => {
    it(`should fail because ${sessionManager.HEADER_NAME} header is not being sent`, (done) => {
      chai.request(server)
        .get('/users/me')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should be successful', (done) => {
      successfulLogin((loginErr, loginRes) => {
        chai.request(server)
          .get('/users/me')
          .set(sessionManager.HEADER_NAME, loginRes.headers[sessionManager.HEADER_NAME])
          .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('firstName');
            res.body.should.have.property('lastName');
            res.body.should.have.property('username');
            res.body.should.have.property('email');
            res.body.should.have.property('password');
            done();
          });
      });
    });
  })

  describe('/users POST', () => {
    it('should fail because email is missing', (done) => {
      chai.request(server)
        .post('/users')
        .send({ firstName: 'firstName', lastName: 'lastName', username: 'username', password: 'password' })
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('error');
          done();
        });
    });

    it('should fail because email is in use', (done) => {
      chai.request(server)
        .post('/users')
        .send({ firstName: 'firstName', lastName: 'lastName', username: 'username',
          password: 'password', email: 'email1@gmail.com' })
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('error');
          done();
        });
    });

    it('should be successful', (done) => {
      chai.request(server)
        .post('/users')
        .send({ firstName: 'firstName', lastName: 'lastName', username: 'username',
          password: 'password', email: 'email' })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  })

  describe('/users PUT', () => {
    it(`should fail because ${sessionManager.HEADER_NAME} header is not being sent`, (done) => {
      chai.request(server)
        .put('/users')
        .send({ firstName: 'firstName' })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should fail because email is in use', (done) => {
      successfulLogin((loginErr, loginRes) => {
        chai.request(server)
          .put('/users')
          .send({ email: 'email2@gmail.com' })
          .set(sessionManager.HEADER_NAME, loginRes.headers[sessionManager.HEADER_NAME])
          .end((err, res) => {
            res.should.have.status(400);
            res.should.be.json;
            res.body.should.have.property('error');
            done();
          });
      });
    });

    it('should be successful', (done) => {
      successfulLogin((loginErr, loginRes) => {
        chai.request(server)
          .put('/users')
          .send({ email: 'email@gmail.com' })
          .set(sessionManager.HEADER_NAME, loginRes.headers[sessionManager.HEADER_NAME])
          .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.should.be.json;
            res.body.should.have.property('firstName');
            res.body.should.have.property('lastName');
            res.body.should.have.property('username');
            res.body.should.have.property('email');
            res.body.should.have.property('password');
            res.headers.should.have.property(sessionManager.HEADER_NAME);
            done();
          });
      });
    });
  })
});
