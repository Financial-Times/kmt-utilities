const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require('chai').expect;
const nock = require('nock');
const httpMocks = require('node-mocks-http');
const config = require('kat-client-proxies/lib/helpers/config');
const expectOwnProperties = require('kat-client-proxies/test/helpers/expectExtensions').expectOwnProperties;
const uuids = require('kat-client-proxies/test/mocks/uuids');
const {getListOfLicences} = require('./../../../index');

describe('middleware/getListOfLicences', () => {
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

	const endpoint = '/get-list-of-licences';

	const req = httpMocks.createRequest({
		method: 'POST',
		url: `${endpoint}`
	});

	it('should get the list of licences for a valid user and return the same list when called again', done => {
		nock(config.ALS_API_URL)
			.get(`/licences?adminuserid=${uuids.validUser}`)
			.reply(200, () => require('kat-client-proxies/test/mocks/fixtures/accessLicenceGetLicence'));

		req.currentUser = {uuid: uuids.validUser};
		const testItem = {
			licenceId: 'test',
			creationDate: 'test',
			status: 'test',
			contractId: 'test',
			product: 'test'
		};

		getListOfLicences(req)
			.then(() => {
				const thisList = req.listOfLicences;
				expect(thisList).to.be.an('array');
				if (thisList.length > 0) {
					expectOwnProperties(thisList, ['licenceId', 'creationDate', 'status', 'contractId', 'product']);
				}
				req.listOfLicences.push(testItem);

				return getListOfLicences(req);
			})
			.then(() => {
				const thisList = req.listOfLicences;
				expect(thisList).to.be.an('array');
				expect(thisList.length).to.be.at.least(1);
				expectOwnProperties(thisList, ['licenceId', 'creationDate', 'status', 'contractId', 'product']);

				const lastItem = thisList.slice(-1)[0];
				expect(lastItem).to.be.an('object');
				expect(lastItem).to.equal(testItem);

				done();
			})
			.catch(done);
	});

	it('should throw an error when no user is provided', done => {
		delete req.currentUser;

		getListOfLicences(req)
			.then(() => {
				done(new Error('Nothing thrown'));
			})
			.catch(err => {
				expect(err).to.be.an.instanceof(Error);

				done();
			});
	});
});
