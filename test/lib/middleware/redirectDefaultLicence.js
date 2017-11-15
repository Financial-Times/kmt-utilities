const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require('chai').expect;
const nock = require('nock');
const httpMocks = require('node-mocks-http');
const config = require('kat-client-proxies/lib/helpers/config');
const uuids = require('kat-client-proxies/test/mocks/uuids');
const {redirectDefaultLicence} = require('./../../../index');

describe('middleware/redirectDefaultLicence', () => {
	let logMessageStub;
	const logMessages = [];

	before(done => {
		logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
			logMessages.push(params);
		});

		done();
	});

	after(done => {
		nock.cleanAll();

		logMessageStub.restore();

		done();
	});

	const endpoint = '/redirect-default-licence';

	const req = httpMocks.createRequest({
		method: 'POST',
		url: `${endpoint}`,
		currentUser: {uuid: uuids.validUser}
	});
	const res = httpMocks.createResponse();

	it('should redirect to the first licence in the available list (when a valid user is provided)', done => {
		nock(config.API_GATEWAY_HOST)
			.get(`/licences?adminuserid=${uuids.validUser}`)
			.reply(200, () => require('kat-client-proxies/test/mocks/fixtures/accessLicenceGetLicence'));


		const nextSpy = sinon.spy();

		redirectDefaultLicence(req, res, nextSpy)
			.then(() => {
				const redirectUrl = res._getRedirectUrl();
				expect(redirectUrl).not.to.be.empty;

				done();
			})
			.catch(done);
	});

	it('should throw an error when a user is not provided and/or there is not licence list', done => {
		delete req.currentUser;

		const nextSpy = sinon.spy(err => {
			expect(err).to.be.an.instanceof(Error);
			expect(err.status).to.equal(404);

			if (err) {
				throw err;
			}
		});

		redirectDefaultLicence(req, res, nextSpy)
			.then(() => {
				done(new Error('Nothing thrown'));
			})
			.catch(err => {
				expect(nextSpy.calledOnce).to.be.true;
				expect(err).to.be.an.instanceof(Error);
				expect(err.status).to.equal(404);

				done();
			});
	});
});
