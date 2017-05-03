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
const validToken = 'validToken';
const uriFragSplitter = require('../../../lib/helpers/uriFragSplitter');
let logMessageStub;
let logMessages = [];
let uriFragSplitterStub;
const locationHeader = `https://www.ft.com/#access_token=${validToken}&scope=licence_data&token_type=bearer&expires_in=1800`

xdescribe('lib/service/apiAuthService', function() {

    //setup
    before(function(done) {
      logMessageStub = sinon.stub(logger, 'log').callsFake(() => {
        logMessages.push(arguments);
      });

        // uriFragSplitterStub = sinon.stub(uriFragSplitter);
        //
        // uriFragSplitterStub.withArgs(locationHeader).callsFake(() => {
        //   return validToken;
        // });

        done();
    });

    afterEach(function(done) {
        console.log(logMessages);
        logMessages = [];

        nock.cleanAll();
        done();
    });

    after(function(done) {
        logMessageStub.restore();
        done();
    });

    it('getAuthToken() should return an access token as a string', function(done) {
      console.log(`🙌  service uri: ${serviceHost}/${serviceUri} with: ${token}`);
        nock('https://api-t.ft.com')
        .filteringPath((path) => {
          return '/authorize';
        })
        .get('/authorize')
          .reply(200, {
            url: ''
        });

        co(function* () {

            let authToken = yield apiAuthService.getAuthToken(token);
            expect(authToken).to.equal('bar');

            done();

        }).catch(done);

    });

 });
