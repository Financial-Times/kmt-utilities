const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require("chai").expect;
const nock = require('nock');
const httpMocks = require('node-mocks-http');
const config = require('kat-client-proxies/lib/helpers/config');
const uuids = require('kat-client-proxies/test/mocks/uuids');
const {getLicenceId} = require('./../../../index');

describe('middleware/getLicenceId', () => {
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

    const endpoint = '/get-licence-id';

    const req = httpMocks.createRequest({
        method: 'POST',
        url: `${endpoint}`

    });
    const res = httpMocks.createResponse();

    it('should validate the licenceId sent as a param based on a pattern', done => {
        req.params.licenceId = uuids.validLicence;

        const nextSpy = sinon.spy();

        getLicenceId(req, res, nextSpy)
            .then(() => {
                expect(nextSpy.calledOnce).to.be.true;

                const thisLicenceId = req.licenceId;
                expect(thisLicenceId).to.be.an('string');
                expect(thisLicenceId).not.to.be.empty;
                expect(thisLicenceId).to.be.equal(uuids.validLicence);

                done();
            })
            .catch(done);
    });

    it('should throw an error for an invalid licence id and no session', done => {
        req.params.licenceId = 'invalidLicenceId';

        const nextSpy = sinon.spy();

        getLicenceId(req, res, nextSpy)
            .then(() => {
                done(new Error('Nothing thrown'));
            })
            .catch(err => {
                expect(nextSpy.calledOnce).to.be.true;
                expect(err).to.be.an.instanceof(Error);

                done();
            });
    });

    it('should redirect when an invalid licence id and a session is provided', done => {
        nock(config.ALS_API_URL)
            .get(`/licences?adminuserid=${uuids.validUser}`)
            .reply(200, () => require('kat-client-proxies/test/mocks/fixtures/accessLicenceGetLicence'));

        req.params.licenceId = 'invalidLicenceId';
        req.session = {isPopulated: true};
        req.currentUser = {uuid: uuids.validUser};

        const nextSpy = sinon.spy();

        getLicenceId(req, res, nextSpy)
            .then(() => {
                const redirectUrl = res._getRedirectUrl();
                expect(redirectUrl).not.to.be.empty;

                done();
            })
            .catch(done);
    });
});
