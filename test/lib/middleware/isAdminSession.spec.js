const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require('chai').expect;
const nock = require('nock');
const httpMocks = require('node-mocks-http');
const config = require('@financial-times/kat-client-proxies/lib/helpers/config');
const expectOwnProperties = require('@financial-times/kat-client-proxies/test/helpers/expectExtensions').expectOwnProperties;
const uuids = require('@financial-times/kat-client-proxies/test/mocks/uuids');
const accessLicenceGetLicenceFixtures = require('@financial-times/kat-client-proxies/test/mocks/fixtures/accessLicenceGetLicence');
const licenceDataAdminsFixtures = require('@financial-times/kat-client-proxies/test/mocks/fixtures/licenceDataAdmins');
const {getAdminUserList, isAdminUser} = require('./../../../index').isAdminSession;

describe('middleware/isAdminSession', () => {
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

	const endpoint = '/is-admin-session';
	const res = httpMocks.createResponse();

	describe('getAdminUserList', () => {
		const req = httpMocks.createRequest({
			method: 'POST',
			url: `${endpoint}/get-admin-user-list`
		});

		it('should get the administrators for a valid licence UUID', done => {
			nock(config.API_GATEWAY_HOST)
				.get(`/licences/${uuids.validLicence}/administrators`)
				.reply(200, () => require('@financial-times/kat-client-proxies/test/mocks/fixtures/accessLicenceAdmins'));

			req.licenceId = uuids.validLicence;
			const nextSpy = sinon.spy();

			getAdminUserList(req, res, nextSpy)
				.then(() => {
					expect(nextSpy.calledOnce).to.be.true;

					const adminUserList = req.adminUserList;
					expect(adminUserList).to.be.an('object');

					const administrators = adminUserList.administrators;
					expect(administrators).to.be.an('array');
					if (administrators.length > 0) {
						expectOwnProperties(administrators, ['accessLicenceId', 'userId', 'joinedDate']);
					}

					done();
				})
				.catch(done);
		});

		it('should get an empty array for an invalid licence UUID', done => {
			nock(config.API_GATEWAY_HOST)
				.get(`/licences/${uuids.invalidLicence}/administrators`)
				.reply(200, () => ({administrators: []}));

			req.licenceId = uuids.invalidLicence;
			const nextSpy = sinon.spy();

			getAdminUserList(req, res, nextSpy)
				.then(() => {
					expect(nextSpy.calledOnce).to.be.true;

					const adminUserList = req.adminUserList;
					expect(adminUserList).to.be.an('object');

					const administrators = adminUserList.administrators;
					expect(administrators).to.be.an('array');
					expect(administrators).to.have.lengthOf(0);

					done();
				})
				.catch(done);
		});
	});

	describe('isAdminUser', () => {
		it('should get the licence list for a valid licence/user UUID and a populated session', done => {
			nock(config.API_GATEWAY_HOST)
				.get(`/licences?adminuserid=${uuids.validUser}`)
				.reply(200, () => accessLicenceGetLicenceFixtures);

			const req = httpMocks.createRequest({
				method: 'POST',
				url: `${endpoint}/is-admin-user`,
				licenceId: uuids.validLicence,
				session: {isPopulated: true},
				currentUser: {uuid: uuids.validUser}
			});


			const nextSpy = sinon.spy();

			isAdminUser(req, res, nextSpy)
				.then(() => {
					expect(nextSpy.calledOnce).to.be.true;

					const katConfig = req.KATConfig;
					expect(katConfig).to.be.an('object');
					expectOwnProperties(katConfig, ['licenceList']);

					const licenceList = katConfig.licenceList;
					expect(licenceList).to.be.an('array');
					if (licenceList.length > 0) {
						expectOwnProperties(licenceList, ['licenceId', 'creationDate', 'status', 'contractId', 'product']);
					}

					done();
				})
				.catch(done);
		});


		it('should get the licence list for a valid licence/user UUID and an unpopulated session', done => {
			nock(config.API_GATEWAY_HOST)
				.get(`/licences?adminuserid=${uuids.validUser}`)
				.reply(200, () => accessLicenceGetLicenceFixtures);

			nock(`${config.API_GATEWAY_HOST}/licence-seat-holders`)
				.get(`/${uuids.validLicence}/admins`)
				.reply(200, () => licenceDataAdminsFixtures);

			const req = httpMocks.createRequest({
				method: 'POST',
				url: `${endpoint}/is-admin-user`,
				licenceId: uuids.validLicence,
				apiAuthToken: 'test',
				session: {},
				currentUser: {uuid: uuids.validUser}
			});

			const nextSpy = sinon.spy();

			isAdminUser(req, res, nextSpy)
				.then(() => {
					expect(nextSpy.calledOnce).to.be.true;

					const katConfig = req.KATConfig;
					expect(katConfig).to.be.an('object');
					expectOwnProperties(katConfig, ['licenceList', 'displayName', 'userId']);
					expect(katConfig.userId).to.equal(uuids.validUser);

					const licenceList = katConfig.licenceList;
					expect(licenceList).to.be.an('array');
					if (licenceList.length > 0) {
						expectOwnProperties(licenceList, ['licenceId', 'creationDate', 'status', 'contractId', 'product']);
					}

					done();
				})
				.catch(done);
		});

		it('should throw and error for a valid licence UUID no user', done => {
			const req = httpMocks.createRequest({
				method: 'POST',
				url: `${endpoint}/is-admin-user`,
				licenceId: uuids.validLicence
			});

			const nextSpy = sinon.spy(err => {
				expect(err).to.be.an.instanceof(Error);

				if (err) {
					throw err;
				}
			});

			isAdminUser(req, res, nextSpy)
				.then(() => {
					done(new Error('Nothing thrown'));
				})
				.catch(err => {
					expect(nextSpy.calledOnce).to.be.true;
					expect(err).to.be.an.instanceof(Error);

					done();
				});
		});

		it('should throw and error for a valid licence UUID and an invalid user id', done => {
			nock(config.API_GATEWAY_HOST)
				.get(`/licences?adminuserid=${uuids.invalidUser}`)
				.reply(200, () => accessLicenceGetLicenceFixtures);

			nock(`${config.API_GATEWAY_HOST}/licence-seat-holders`)
				.get(`/${uuids.validLicence}/admins`)
				.reply(200, () => licenceDataAdminsFixtures);

			const req = httpMocks.createRequest({
				method: 'POST',
				url: `${endpoint}/is-admin-user`,
				licenceId: uuids.validLicence,
				currentUser: {uuid: uuids.invalidUser}
			});

			const nextSpy = sinon.spy(err => {
				expect(err).to.be.an.instanceof(Error);
				expect(err.status).to.equal(403);

				if (err) {
					throw err;
				}
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

		it('should throw an error for an invalid licence UUID', done => {
			nock(config.API_GATEWAY_HOST)
				.get(`/licences?adminuserid=${uuids.validUser}`)
				.reply(200, () => accessLicenceGetLicenceFixtures);

			nock(`${config.API_GATEWAY_HOST}/licence-seat-holders`)
				.get(`/${uuids.invalidLicence}/admins`)
				.reply(401, () => null);

			const req = httpMocks.createRequest({
				method: 'POST',
				url: `${endpoint}/is-admin-user`,
				licenceId: uuids.invalidLicence,
				apiAuthToken: 'test',
				currentUser: {uuid: uuids.validUser}
			});

			const nextSpy = sinon.spy(err => {
				expect(err).to.be.an.instanceof(Error);

				if (err) {
					throw err;
				}
			});

			isAdminUser(req, res, nextSpy)
				.then(() => {
					done(new Error('Nothing thrown'));
				})
				.catch(err => {
					expect(nextSpy.calledOnce).to.be.true;
					expect(err).to.be.an.instanceof(Error);

					done();
				});
		});
	});
});
