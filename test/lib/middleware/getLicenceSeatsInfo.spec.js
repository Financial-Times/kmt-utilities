const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require('chai').expect;
const nock = require('nock');
const httpMocks = require('node-mocks-http');
const config = require('@financial-times/kat-client-proxies/lib/helpers/config');
const expectOwnProperties = require('@financial-times/kat-client-proxies/test/helpers/expectExtensions').expectOwnProperties;
const uuids = require('@financial-times/kat-client-proxies/test/mocks/uuids');
const {getLicenceSeatsInfo} = require('./../../../index');
const seatHolders = require('./../fixtures/licenceSeatHolders');

describe('middleware/getLicenceSeatsInfo', () => {
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

	const endpoint = '/get-licence-seats-info';

	const req = httpMocks.createRequest({
		method: 'POST',
		url: `${endpoint}`
	});
	const res = httpMocks.createResponse();

	it('should get the licence info (seatLimit, seatsAllocated) for a valid licence id', done => {
		nock(config.API_GATEWAY_HOST)
			.get(`/licences/${uuids.validLicence}`)
			.reply(200, () => require('@financial-times/kat-client-proxies/test/mocks/fixtures/accessLicenceInfo'));

		nock(config.API_GATEWAY_HOST)
			.get(`/licence-seat-holders/${uuids.validLicence}`)
			.reply(200, () => seatHolders);

		req.licenceId = uuids.validLicence;
		const nextSpy = sinon.spy();

		getLicenceSeatsInfo(req, res, nextSpy)
			.then(() => {
				expect(nextSpy.calledOnce).to.be.true;

				const seatInfo = req.licenceSeatsInfo;
				expect(seatInfo).to.be.an('object');
				expectOwnProperties(seatInfo, ['seatLimit', 'seatsAllocated']);

				done();
			})
			.catch(done);
	});

	it('should not throw an error when an invalid licence id is provided', done => {
		nock(config.API_GATEWAY_HOST)
			.get(`/licences/${uuids.invalidLicence}`)
			.reply(404, () => null);

		nock(config.API_GATEWAY_HOST)
			.get(`/licences/${uuids.invalidLicence}/seats`)
			.reply(200, () => ({seats: [], 'allocatedSeatCount': 0}));

		req.licenceId = uuids.invalidLicence;
		const nextSpy = sinon.spy();

		getLicenceSeatsInfo(req, res, nextSpy)
			.then(() => {
				expect(nextSpy.calledOnce).to.be.true;

				const seatInfo = req.licenceSeatsInfo;
				expect(seatInfo).to.be.an('object');
				expectOwnProperties(seatInfo, ['seatLimit', 'seatsAllocated']);

				done();
			})
			.catch(done);
	});
});
