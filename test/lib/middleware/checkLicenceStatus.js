const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require("chai").expect;
const nock = require('nock');
const httpMocks = require('node-mocks-http');
const config = require('kat-client-proxies/lib/helpers/config');
const expectOwnProperties = require('kat-client-proxies/test/helpers/expectExtensions').expectOwnProperties;
const clientErrors = require('kat-client-proxies').clientErrors;
const uuids = require('kat-client-proxies/test/mocks/uuids');
const mockAPI = require('kat-client-proxies/test/helpers/env').USE_MOCK_API;
const {isActive, getLicenceDisplayInfo} = require('./../../../index').checkLicenceStatus;

describe('Users endpoints', () => {
    let logMessageStub;
    const logMessages = [];

    before(done => {
        logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
            logMessages.push(params);
        });

        done();
    });

    after(done => {
        if (mockAPI) {
            nock.cleanAll();
        }

        logMessageStub.restore();

        done();
    });

    describe('middleware/checkLicenceStatus', () => {
        const endpoint = '/check-licence-status';

        describe('isActive', () => {
            const baseUrl = config.ALS_API_URL;
            const req = httpMocks.createRequest({
                method: 'POST',
                url: `${endpoint}/is-active`
            });
            const res = httpMocks.createResponse();

            it('should call next() and set Cache-Control for a valid licence ID', done => {
                if (mockAPI) {
                    nock(baseUrl)
                        .get(`/licences/${uuids.validLicence}`)
                        .reply(200, () => require('kat-client-proxies/test/mocks/fixtures/accessLicenceInfo'));
                }

                req.licenceId = uuids.validLicence;
                const nextSpy = sinon.spy();

                isActive(req, res, nextSpy)
                    .then(() => {
                        expect(nextSpy.calledOnce).to.be.true;

                        const headers = res._getHeaders();
                        expect(headers['Cache-Control']).to.equal('private, no-cache, no-store, must-revalidate');

                        done();
                    })
                    .catch(done);
            });

            it('should call next() with an error for an invalid licenceId', done => {
                if (mockAPI) {
                    nock(baseUrl)
                        .get(`/licences/${uuids.invalidLicence}`)
                        .reply(404, () => null);
                }
                req.licenceId = uuids.invalidLicence;
                const nextSpy = sinon.spy(err => {
                    if (err) {
                        throw err;
                    }
                });

                isActive(req, res, nextSpy)
                    .then(() => {
                        done(new Error('Nothing thrown'));
                    })
                    .catch(err => {
                        expect(nextSpy.calledOnce).to.be.true;
                        expect(err).to.be.an.instanceof(clientErrors.NotFoundError);

                        done();
                    });
            });
        });

        describe('getLicenceDisplayInfo', () => {
            const baseUrl = `${config.ACS_API_URL}/acquisition-contexts`;

            const req = httpMocks.createRequest({
                method: 'POST',
                url: `${endpoint}/get-licence-display-info`
            });
            const res = httpMocks.createResponse();

            it('should call next() for a valid licence ID', done => {
                if (mockAPI) {
                    nock(baseUrl)
                        .get(`?access-licence-id=${uuids.validLicence}`)
                        .reply(200, () => require('kat-client-proxies/test/mocks/fixtures/acquisitionContext'));
                }

                req.licenceId = uuids.validLicence;
                const nextSpy = sinon.spy();

                getLicenceDisplayInfo(req, res, nextSpy)
                    .then(() => {
                        expect(nextSpy.calledOnce).to.be.true;

                        done();
                    })
                    .catch(done);
            });

            it('should call next() for a invalid licence ID', done => {
                if (mockAPI) {
                    nock(baseUrl)
                        .get(`?access-licence-id=${uuids.invalidLicence}`)
                        .reply(200, () => ({items: []}));
                }

                req.licenceId = uuids.invalidLicence;
                const nextSpy = sinon.spy();

                getLicenceDisplayInfo(req, res, nextSpy)
                    .then(() => {
                        expect(nextSpy.calledOnce).to.be.true;

                        done();
                    })
                    .catch(done);
            });
        });
    });
});

