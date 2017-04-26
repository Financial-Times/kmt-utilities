const chai = require('chai');
const expect = chai.expect;
const nock = require('nock');
const config = require('../../../lib/config');
const envConf = require('../../config.json');
const sinon = require('sinon');
const co = require('co');
const logger = require('../../../lib/logger');
const accessLicenceService = require('../../../lib/services/accessLicenceService');

describe('lib/services/accessLicenceService', function() {

  const accessLicenceId = 'foobarfoobarfoo';
  const accessLicenceServiceHost = envConf.API_GATEWAY_HOST;
  const accessLicenceServiceGetUri = '/membership/licences/v1/' + accessLicenceId;
  const accessLicenceServiceSeatsUri = accessLicenceServiceGetUri + '/seats';
  const accessLicenceServiceAdminsUri = accessLicenceServiceGetUri + '/administrators';
  let logMessages = [];
  let logMessageStub;

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

  //happy path
  it('getLicenceInfo() should return licence info', function(done) {
    nock(accessLicenceServiceHost)
      .get(accessLicenceServiceGetUri)
      .reply(200, function(uri, body) {
        return {hello: true};
      });

    co(function* () {
      const licenceInfo = yield accessLicenceService.getLicenceInfo(accessLicenceId);

      expect(licenceInfo).to.exist;

      done();
    }).catch(done);
  });

  it('getLicenceInfo() licence info should have proper structure', function(done) {
    const responseKeys = ['products', 'seatLimit', 'adminsHref', 'seatsHref'];
    nock(accessLicenceServiceHost)
      .get(accessLicenceServiceGetUri)
      .reply(200, function(uri, body) {
        return {products: true, seatLimit: true, adminsHref: true, seatsHref: true};
      });

    co(function* () {
      const licenceInfo = yield accessLicenceService.getLicenceInfo(accessLicenceId);
      expect(licenceInfo).to.contain.all.keys(responseKeys);
      done();
    }).catch(done);
  });

  it('getLicenceInfo() should retrieve license info from ALS', function(done) {
    nock(accessLicenceServiceHost)
      .get(accessLicenceServiceGetUri)
      .reply(200, function(uri, body) {
        expect(uri).to.contain(accessLicenceServiceGetUri);
        return {hello: true};
      });

    co(function* () {
      const licenceInfo = yield accessLicenceService.getLicenceInfo(accessLicenceId);
      done();
    }).catch(done);
  });

  it('getLicenceInfo() should throw error with invalid licence id', function(done) {
    nock(accessLicenceServiceHost)
      .get(accessLicenceServiceGetUri)
      .reply(400);

    co(function* () {
      try {
        yield accessLicenceService.getLicenceInfo(accessLicenceId);
      } catch (err) {
        expect(err.status).to.eql(400);
        done();
      }
    }).catch(done);
  });

  it('getSeats() should throw error if it receives an error from ALS', function(done) {
    nock(accessLicenceServiceHost)
      .get(accessLicenceServiceSeatsUri)
      .reply(500);

    co(function* () {
      try {
        yield accessLicenceService.getSeats(accessLicenceId);
      } catch (err) {
        expect(err).to.exist;
        expect(err.status).to.eql(500);
        done();
      }
    }).catch(done);
  });

  it('getSeats() should return the parsed JSON response given a successful response from ALS  ', function(done) {
    const data = {
      seats: []
    };

    nock(accessLicenceServiceHost)
      .get(accessLicenceServiceSeatsUri)
      .reply(200, data);

    co(function* () {
      const response = yield accessLicenceService.getSeats(accessLicenceId);
      expect(response).to.eql(data);
      done();
    }).catch(done);
  });

  //Get admin happy path
  it('getAdministrators() should return parsed JSON if the response from ALS is successful', function(done) {
    const data = {
      administrators: []
    };

    nock(accessLicenceServiceHost)
      .get(accessLicenceServiceSeatsUri)
      .reply(200, data);

    co(function* () {
      const response = yield accessLicenceService.getSeats(accessLicenceId);
      expect(response).to.eql(data);
      done();
    }).catch(done);
  });

  //get Admin sad path
  it('getAdministrators() should throw an error if it the response from ALS is unsuccessful', function(done) {
    nock(accessLicenceServiceHost)
      .get(accessLicenceServiceAdminsUri)
      .reply(500);

    co(function* () {
      try {
        yield accessLicenceService.getAdministrators(accessLicenceId);
      } catch (err) {
        expect(err).to.exist;
        expect(err.status).to.eql(500);
        done();
      }
    }).catch(done);
  });
});
