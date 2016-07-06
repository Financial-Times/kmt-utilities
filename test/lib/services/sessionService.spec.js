var chai = require('chai');
var expect = chai.expect;
var nock = require('nock');
var config = require('../../../lib/config');
var sinon = require('sinon');
var co = require('co');
var logger = require('../../../lib/logger');
var sessionService = require('../../../lib/services/sessionService');

var serviceHost = config.get('SESSION_API_HOST');
var serviceUri = '/membership/sessions/foobar';

var logMessageStub,
  logMessages = [];

describe('lib/services/sessionService', function() {

  //setup

  before(function(done) {
    logMessageStub = sinon.stub(logger, 'log', function() {
      logMessages.push(arguments);
    });

    done();
  });

  afterEach(function(done) {
    logMessages = [];

    nock.cleanAll();

    done();
  });

  after(function(done) {
    logMessageStub.restore();

    done();
  });

  //test happy path

  it ('verify() should return valid JSON is the response is 200', function(done) {
    nock(serviceHost).get(serviceUri).reply(200, {
      foo: 'bar'
    });

    co(function* () {
      var response = yield sessionService.verify('foobar');

      expect(response).to.be.an('object');
      expect(response.foo).to.equal('bar');

      expect(logMessages).to.have.length(2);

      expect(logMessages[0][0]).to.equal('info');
      expect(logMessages[0][1]).to.equal('Verifying session for sessionKey=%s');
      expect(logMessages[0][2]).to.equal('foobar');

      expect(logMessages[1][0]).to.equal('info');
      expect(logMessages[1][1]).to.equal('Session verified for sessionKey=%s');
      expect(logMessages[1][2]).to.equal('foobar');

      done();
    });
  });

  //test unhappy path

  it ('verify() should return an exception if response is not 200', function(done) {
    nock(serviceHost).get(serviceUri).reply(404, {
      foo: 'bar'
    });

    co(function* () {
      try {
        yield sessionService.verify('foobar');
      }
      catch (e) {
        expect(e).to.be.an.instanceOf(Error);
        expect(e.message).to.equal('Not Found');

        expect(logMessages).to.have.length(3);

        expect(logMessages[0][0]).to.equal('info');
        expect(logMessages[0][1]).to.equal('Verifying session for sessionKey=%s');
        expect(logMessages[0][2]).to.equal('foobar');

        expect(logMessages[1][0]).to.equal('error');
        expect(logMessages[1][1]).to.equal('Unable to verify session for sessionKey=%s');
        expect(logMessages[1][2]).to.equal('foobar');

        expect(logMessages[2][0]).to.equal('error');
        expect(logMessages[2][1]).to.equal('Response: ');
        expect(logMessages[2][2]).to.equal('Not Found');

        done();
      }
    });
  });

  it ('verify() should return an exception with the correct message if response is not 200', function(done) {
    nock(serviceHost).get(serviceUri).reply(404, {
      message: 'foobar'
    });

    co(function* () {
      try {
        yield sessionService.verify('foobar');
      }
      catch (e) {
        expect(e).to.be.an.instanceOf(Error);

        expect(logMessages).to.have.length(3);

        expect(logMessages[0][0]).to.equal('info');
        expect(logMessages[0][1]).to.equal('Verifying session for sessionKey=%s');

        expect(logMessages[1][0]).to.equal('error');
        expect(logMessages[1][1]).to.equal('Unable to verify session for sessionKey=%s');

        expect(logMessages[2][0]).to.equal('error');
        expect(logMessages[2][1]).to.equal('Response: ');
        expect(logMessages[2][2]).to.equal('Not Found');

        done();
      }
    }).catch(done);
  });

  it ('verify() should return an exception if the response is not valid JSON', function(done) {
    nock(serviceHost).get(serviceUri).reply(200, 'foobar');

    co(function* () {
      try {
        yield sessionService.verify('foobar');
      }
      catch (e) {
        expect(e).to.be.an.instanceOf(Error);
        expect(e.message).to.equal('Unexpected token o');

        expect(logMessages[0][0]).to.equal('info');
        expect(logMessages[0][1]).to.equal('Verifying session for sessionKey=%s');

        done();
      }
    }).catch(done);
  });
});
