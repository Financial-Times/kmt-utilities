const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const nock = require('nock');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const clientErrors = require('kat-client-proxies').clientErrors;
const uuids = require('kat-client-proxies/test/mocks/uuids');
const { getAuthToken } = require('./../../../index');
const getSessionToken = require('./../helpers/getSessionToken');
const config = require('kat-client-proxies/lib/helpers/config');

describe('middleware/getAuthToken', () => {
	let logMessageStub;
	const logMessages = [];
	let sessionToken;

	before(done => {
		logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
			logMessages.push(params);
		});

		getSessionToken()
			.then(response => {
				sessionToken = response;

				done();
			})
			.catch(done);
	});

	after(() => {
		logMessageStub.restore();
	});

	afterEach(() => {
		nock.cleanAll();
	});

	const endpoint = '/get-auth-token';
	const reqOptions = {
		method: 'POST',
		url: `${endpoint}`,
		params: {
			licenceId: uuids.validLicence
		}
	};
	const res = httpMocks.createResponse();

	it('should get the auth token for a valid sessionToken and should return the same one when called a second time', done => {
		const req = httpMocks.createRequest(reqOptions);
		req.headers.cookie = `FTSession_s=${sessionToken}`;
		const nextSpy = sinon.spy();
		let freshToken;

		// get the authorisation token.
        // This requires that we redirect to another URL with the access token placed
        // after the hash, so this nock handles the redirect, and the next nock looks
        // after the URL we are redirecting to.
        nock(config.API_GATEWAY_HOST)
			.get('/authorize')
			.query(true)
			.reply(301, undefined, { location: 'https://www.ft.com/#access_token=12345' });

		nock('https://www.ft.com')
			.get('/')
			.reply(200);

		getAuthToken(req, res, nextSpy)
			.then(() => {
				expect(nextSpy.calledOnce).to.be.true;

				const thisToken = req.apiAuthToken;
				expect(thisToken).to.be.an('string');
				expect(thisToken).not.to.be.empty;
				freshToken = thisToken;

				return getAuthToken(req, res, nextSpy);
			})
			.then(() => {
				expect(nextSpy.calledTwice).to.be.true;

				const thisToken = req.apiAuthToken;
				expect(thisToken).to.be.an('string');
				expect(thisToken).not.to.be.empty;
				expect(thisToken).to.be.equal(freshToken);
				done();
			})
			.catch(done);
	});

	it('should call next() with an error for an invalid sessionToken', done => {
		const req = httpMocks.createRequest(reqOptions);
		req.headers.cookie = 'FTSession_s=invalid';
		const nextSpy = sinon.spy(err => {
			expect(err).to.be.an.instanceof(clientErrors.NotAuthorisedError);

			if (err) {
				throw err;
			}
		});

		getAuthToken(req, res, nextSpy)
			.then(() => {
				done(new Error('Nothing thrown'));
			})
			.catch(err => {
				expect(nextSpy.calledOnce).to.be.true;
				expect(err).to.be.an.instanceof(clientErrors.NotAuthorisedError);

				done();
			});
	});
});
