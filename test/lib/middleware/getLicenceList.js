const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require('chai').expect;
const nock = require('nock');
const httpMocks = require('node-mocks-http');
const config = require('@financial-times/kat-client-proxies/lib/helpers/config');
const expectOwnProperties = require('@financial-times/kat-client-proxies/test/helpers/expectExtensions').expectOwnProperties;
const uuids = require('@financial-times/kat-client-proxies/test/mocks/uuids');
const {getLicenceList} = require('./../../../index');

describe('middleware/getLicenceList', () => {
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


	const endpoint = '/get-licence-list';

	const req = httpMocks.createRequest({
		method: 'POST',
		url: `${endpoint}`

	});
	const res = httpMocks.createResponse();

	it('should get the list of licences for a valid user', done => {
		nock(config.API_GATEWAY_HOST)
			.get(`/licences?adminuserid=${uuids.validUser}`)
			.reply(200, () => require('@financial-times/kat-client-proxies/test/mocks/fixtures/accessLicenceGetLicence'));

		req.currentUser = {uuid: uuids.validUser};

		const nextSpy = sinon.spy();

		getLicenceList(req, res, nextSpy)
			.then(() => {
				expect(nextSpy.calledOnce).to.be.true;

				const thisList = req.listOfLicences;
				expect(thisList).to.be.an('array');
				if (thisList.length > 0) {
					expectOwnProperties(thisList, ['licenceId', 'creationDate', 'status', 'contractId', 'product']);
				}

				done();
			})
			.catch(done);
	});

	it('should throw an error when no user is provided', done => {
		delete req.currentUser;

		const nextSpy = sinon.spy(err => {
			expect(err).to.be.an.instanceof(Error);
			expect(err.status).to.equal(403);

			if (err) {
				throw err;
			}
		});

		getLicenceList(req, res, nextSpy)
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
