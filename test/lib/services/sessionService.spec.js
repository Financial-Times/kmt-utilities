const chai = require('chai');
const expect = chai.expect;
const nock = require('nock');
const config = require('../../../lib/config');
const sinon = require('sinon');
const co = require('co');
const logger = require('../../../lib/logger');
const sessionService = require('../../../lib/services/sessionService');

const serviceHost = config.get('API_GATEWAY_HOST');
const serviceUri = '/sessions/foobar';

let logMessageStub;
let  logMessages = [];

describe('lib/services/sessionService', function() {

  //setup

  before(function(done) {
    logMessageStub = sinon.stub(logger, 'log').callsFake(() => {
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
      const response = yield sessionService.verify('foobar');

      expect(response).to.be.an('object');
      expect(response.foo).to.equal('bar');

      done();
    }).catch(done);
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
        expect(e.message).to.equal('Invalid session');

        done();
      }
    }).catch(done);
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
        expect(e.message).to.include('Unexpected token o');

        done();
      }
    }).catch(done);
  });
});
