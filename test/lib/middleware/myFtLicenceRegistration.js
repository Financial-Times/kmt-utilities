const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require("chai").expect;
const nock = require('nock');
const httpMocks = require('node-mocks-http');
const config = require('kat-client-proxies/lib/helpers/config');
const uuids = require('kat-client-proxies/test/mocks/uuids');
const {checkAndRegister} = require('./../../../index').myFtLicenceRegistration;

const myftConst = config.myftClientConstants;

describe('middleware/myFtLicenceRegistration', () => {
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

    const endpoint = '/my-ft-licence-registration';

    const res = httpMocks.createResponse();

    describe('checkAndRegister', () => {
        const req = httpMocks.createRequest({
            method: 'POST',
            url: `${endpoint}`,
            licenceId: uuids.validLicence,
            currentUser: {uuid: uuids.validUser}
        });
        const licenceDetails = require('kat-client-proxies/test/mocks/fixtures/getLicence');
        licenceDetails[config.FT_TOOL_DATE_ID] = '1476437354312';

        it('should not try any operations as the licence is already registered', done => {
            nock(config.MYFT_API_URL)
                .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}`)
                .reply(200, () => licenceDetails);

            const nextSpy = sinon.spy();

            checkAndRegister(req, res, nextSpy)
                .then(() => {
                    expect(nextSpy.calledOnce).to.be.true;

                    done();
                })
                .catch(done);
        });

        it('should check and register the licence/group/users', done => {
            delete licenceDetails[config.FT_TOOL_DATE_ID];

            nock(config.MYFT_API_URL)
                .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}`)
                .reply(200, () => licenceDetails);

            nock(config.MYFT_API_URL)
                .post(`/${myftConst.licenceNodeName}`)
                .reply(200, () => ({}));

            nock(config.MYFT_API_URL)
                .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.groupNodeName}/${uuids.validLicence}`)
                .reply(200, () => require('kat-client-proxies/test/mocks/fixtures/getGroupFromLicence'));

            nock(config.MYFT_API_URL)
                .post(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.groupNodeName}?noEvent=${config.MYFT_NO_EVENT}&waitForPurge=${config.MYFT_WAIT_FOR_PURGE_ADD}`)
                .reply(200, () => ([]));

            nock(config.ALS_API_URL)
                .get(`/licences/${uuids.validLicence}/seats`)
                .reply(200, () => require('kat-client-proxies/test/mocks/fixtures/accessLicenceGetSeats'));

            nock(config.MYFT_API_URL)
                .get(`/${myftConst.licenceNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}?page=1&limit=500`)
                .reply(200, () => require('kat-client-proxies/test/mocks/fixtures/getLicenceMembers'));

            nock(config.MYFT_API_URL)
                .get(`/${myftConst.groupNodeName}/${uuids.validLicence}/${myftConst.memberRelName}/${myftConst.userNodeName}?page=1&limit=500`)
                .reply(200, () => require('kat-client-proxies/test/mocks/fixtures/getLicenceMembers'));

            nock(config.MYFT_API_URL)
                .put(`/${myftConst.licenceNodeName}/${uuids.validLicence}`)
                .reply(200, () => ({}));

            const nextSpy = sinon.spy();

            checkAndRegister(req, res, nextSpy)
                .then(() => {
                    expect(nextSpy.calledOnce).to.be.true;

                    done();
                })
                .catch(done);
        });

        it('should throw an error if no licence and/or user is provided', done => {
            const req = httpMocks.createRequest({
                method: 'POST',
                url: `${endpoint}`
            });

            const nextSpy = sinon.spy(err => {
                expect(err).to.be.an.instanceof(Error);
            });

            checkAndRegister(req, res, nextSpy)
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

