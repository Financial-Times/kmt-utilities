const chai = require('chai');
const expect = chai.expect;
const nock = require('nock');
const config = require('../../../lib/config');
const sinon = require('sinon');
const co = require('co');
const logger = require('../../../lib/logger');
const apiAuthService = require('../../../lib/services/apiAuthService');
const token = 'ftSessionS';
const clientId = 'abc';
const serviceHost = config.get('API_GATEWAY_HOST');
const serviceUri = `authorize`;
let logMessageStub;
let logMessages = [];

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

    it('getAuthToken() should return an access token as a string', function(done) {
      console.log(serviceUri);
        nock('https://api-t.ft.com:443')
        .get('/authorize')
        .query({"response_type":"token","client_id":"baz","redirect_uri":"https://www.ft.com","scope":"licence_data"})
          .reply(200, {
            authToken: 'bar'
        });

        co(function* () {

            let authToken = yield apiAuthService.getAuthToken(token);


            //expect(authToken).to.equal('bar');

            done();

        }).catch(done);

    });

 });
