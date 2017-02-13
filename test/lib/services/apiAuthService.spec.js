var chai = require('chai');
var expect = chai.expect;
var nock = require('nock');
var config = require('../../../lib/config');
var sinon = require('sinon');
var co = require('co');
var logger = require('../../../lib/logger');
var apiAuthService = require('../../../lib/services/apiAuthService');

var serviceHost = config.get('API_GATEWAY_HOST');
var serviceUri = '/authorize?response_type=token&client_id=';
var logMessages = [];

let req = {
        FTSession: 'foo'
    }

describe('lib/service/apiAuthService', function() {

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

    xit('getAuthToken() should return an access token as a string', function(done) {

        nock(serviceHost).get(serviceUri).reply(200, {
            authToken: 'bar'
        });

        co(function* () {

            let authToken = yield apiAuthService.getAuthToken(req);


            expect(authToken).to.equal('bar');

            done();

        }).catch(done);

    });

 });
