const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const expectOwnProperties = require('@financial-times/kat-client-proxies/test/helpers/expectExtensions').expectOwnProperties;
const uuids = require('@financial-times/kat-client-proxies/test/mocks/uuids');
const {isAdminUser} = require('./../../../index');

describe('middleware/isAdminUser', () => {
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


	const endpoint = '/is-admin-user';

	const res = httpMocks.createResponse();

	it('should get the admin credentials for a valid user and admin list', done => {
		const req = httpMocks.createRequest({
			method: 'POST',
			url: `${endpoint}`,
			adminUserList: {
				administrators: [
					{
						accessLicenceId: uuids.validLicence,
						userId: uuids.validUser,
						joinedDate: '2016-10-21T13:29:22.412Z'
					}
				]
			},
			currentUser: {uuid: uuids.validUser}
		});

		const nextSpy = sinon.spy();

		isAdminUser(req, res, nextSpy)
			.then(() => {
				expect(nextSpy.calledOnce).to.be.true;

				const cred = req.adminCredentials;
				expect(cred).to.be.an('object');
				expectOwnProperties(cred, ['accessLicenceId', 'userId', 'joinedDate']);

				done();
			})
			.catch(done);
	});

	it('should throw an error when no user and/or admin list is provided', done => {
		const req = httpMocks.createRequest({
			method: 'POST',
			url: `${endpoint}`
		});

		const nextSpy = sinon.spy(err => {
			expect(err).to.be.an.instanceof(Error);
		});

		isAdminUser(req, res, nextSpy)
			.then(() => {
				done(new Error('Nothing thrown'));
			})
			.catch(err => {
				expect(nextSpy.calledOnce).to.be.true;
				expect(err).to.be.an.instanceof(Error);
				expect(err.status).to.equal(403);

				done();
			});
	});
});
