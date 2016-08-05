var chai = require('chai');
var expect = chai.expect;
var nock = require('nock');
var config = require('../../../lib/config');
var sinon = require('sinon');
var co = require('co');
var logger = require('../../../lib/logger');
var accessLicenceService = require('../../../lib/services/accessLicenceService');

describe('lib/services/accessLicenceService', function() {

  let accessLicenceId = 'foobarfoobarfoo';
  let accessLicenceServiceHost = config.get('ACC_LICENCE_SVC_HOST');
  let accessLicenceServiceGetUri = '/membership/licences/v1/' + accessLicenceId;
  let accessLicenceServiceSeatsUri = accessLicenceServiceGetUri + '/seats';
  let accessLicenceServiceAdminsUri = accessLicenceServiceGetUri + '/administrators';
  let logMessageStub;
  let logMessages = [];

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
      var licenceInfo = yield accessLicenceService.getLicenceInfo(accessLicenceId);

      expect(licenceInfo).to.exist;

      done();
    }).catch(done);
  });

  it('getLicenceInfo() licence info should have proper structure', function(done) {
    var responseKeys = ['products', 'seatLimit', 'adminsHref', 'seatsHref'];
    nock(accessLicenceServiceHost)
      .get(accessLicenceServiceGetUri)
      .reply(200, function(uri, body) {
        return {products: true, seatLimit: true, adminsHref: true, seatsHref: true};
      });

    co(function* () {
      var licenceInfo = yield accessLicenceService.getLicenceInfo(accessLicenceId);
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
      var licenceInfo = yield accessLicenceService.getLicenceInfo(accessLicenceId);
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
    var data = {
      seats: []
    };

    nock(accessLicenceServiceHost)
      .get(accessLicenceServiceSeatsUri)
      .reply(200, data);

    co(function* () {
      var response = yield accessLicenceService.getSeats(accessLicenceId);
      expect(response).to.eql(data);
      done();
    }).catch(done);
  });

  //Get admin happy path
  it('getAdministrators() should return parsed JSON if the response from ALS is successful', function(done) {
    var data = {
      administrators: []
    };

    nock(accessLicenceServiceHost)
      .get(accessLicenceServiceSeatsUri)
      .reply(200, data);

    co(function* () {
      var response = yield accessLicenceService.getSeats(accessLicenceId);
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
