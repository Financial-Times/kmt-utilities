const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const uuids = require('@financial-times/kat-client-proxies/test/mocks/uuids');
const {redirectToExistingSession} = require('./../../../index');

describe('middleware/redirectToExistingSession', () => {
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

	const endpoint = '/redirect-to-existing-session';

	const req = httpMocks.createRequest({
		method: 'POST',
		url: `${endpoint}`,
		session: {
			isPopulated: true,
			kmtLoggedIn: {
				displayName: 'test',
				userId: uuids.validUser
			}
		},
		currentUser: {uuid: uuids.validUser},
		listOfLicences:  [
			{
				licenceId: uuids.validLicence,
				creationDate: '2015-11-30T14:53:32.795Z',
				status: 'active',
				contractId: 'test',
				product: 'test'
			}
		]
	});
	const res = httpMocks.createResponse();

	it('should redirect to the first licence in the provided available list', done => {
		const nextSpy = sinon.spy();

		redirectToExistingSession(req, res, nextSpy)
			.then(() => {
				const redirectUrl = res._getRedirectUrl();
				expect(redirectUrl).not.to.be.empty;

				done();
			})
			.catch(done);
	});

	it('should throw an error when the list of available licences is not provided', done => {
		delete req.listOfLicences;

		const nextSpy = sinon.spy(err => {
			expect(err).to.be.an.instanceof(Error);
			expect(err.status).to.equal(404);
		});

		redirectToExistingSession(req, res, nextSpy)
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

	it('should throw an error when there is no session', done => {
		delete req.session;

		const nextSpy = sinon.spy(err => {
			expect(err).to.be.an.instanceof(Error);
			expect(err.status).to.equal(404);
		});

		redirectToExistingSession(req, res, nextSpy)
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
