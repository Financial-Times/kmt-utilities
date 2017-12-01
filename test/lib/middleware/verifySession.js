const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require('chai').expect;
const nock = require('nock');
const httpMocks = require('node-mocks-http');
const config = require('@financial-times/kat-client-proxies/lib/helpers/config');
const expectOwnProperties = require('@financial-times/kat-client-proxies/test/helpers/expectExtensions').expectOwnProperties;
const uuids = require('@financial-times/kat-client-proxies/test/mocks/uuids');
const {getUserId} = require('./../../../index').verifySession;

describe('middleware/verifySession', () => {
	let logMessageStub;
	const logMessages = [];

	before(done => {
		logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
			logMessages.push(params);
		});

		done();
	});

	after(done => {
		logMessageStub.restore();

		done();
	});

	const endpoint = '/verify-session';

	describe('getUserId', () => {
		const req = httpMocks.createRequest({
			method: 'POST',
			url: `${endpoint}/get-user-id`,
			params: {
				licenceId: uuids.validLicence
			}
		});
		const res = httpMocks.createResponse();

		it('should validate the session and return the logged in user details', done => {
			nock(config.API_GATEWAY_HOST)
				.get(`/sessions/${uuids.validFTSession}`)
				.reply(200, () => require('@financial-times/kat-client-proxies/test/mocks/fixtures/sessionVerify'));

			req.headers.cookie = `FTSession=${uuids.validFTSession}`;
			const nextSpy = sinon.spy();

			getUserId(req, res, nextSpy)
				.then(() => {
					expect(nextSpy.calledOnce).to.be.true;

					const currentUser = req.currentUser;
					expect(currentUser).to.be.an('object');
					expectOwnProperties(currentUser, ['uuid', 'creationTime', 'rememberMe']);

					done();
				})
				.catch(done);
		});

		it('should redirect to login when no session is provided', done => {
			delete req.headers.cookie;

			const nextSpy = sinon.spy();

			getUserId(req, res, nextSpy)
				.then(() => {
					const redirectUrl = res._getRedirectUrl();
					expect(redirectUrl).not.to.be.empty;

					done();
				})
				.catch(done);
		});
	});
});
