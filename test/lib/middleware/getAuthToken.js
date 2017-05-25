const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require("chai").expect;
const nock = require('nock');
const httpMocks = require('node-mocks-http');
const clientErrors = require('kat-client-proxies').clientErrors;
const uuids = require('kat-client-proxies/test/mocks/uuids');
const mockAPI = require('kat-client-proxies/test/helpers/env').USE_MOCK_API;
const {getAuthToken} = require('./../../../index');
const getSessionToken = require('./../helpers/getSessionToken');

describe('Users endpoints', () => {
    let logMessageStub;
    const logMessages = [];
    let sessionToken;

    before(done => {
        logMessageStub = sinon.stub(logger, 'log').callsFake((...params) => {
            logMessages.push(params);
        });

        getSessionToken()
            .then(response => {
                sessionToken = response;

                done();
            })
            .catch(done);
    });

    after(done => {
        if (mockAPI) {
            nock.cleanAll();
        }

        logMessageStub.restore();

        done();
    });

    describe('middleware/getAuthToken', () => {
        const endpoint = '/get-auth-token';
        const reqOptions = {
            method: 'POST',
            url: `${endpoint}`,
            params: {
                licenceId: uuids.validLicence
            }
        };
        const res = httpMocks.createResponse();

        it('should get the auth token for a valid sessionToken and should return the same one when called a second time', done => {
            const req = httpMocks.createRequest(reqOptions);
            req.headers.cookie = `FTSession_s=${sessionToken}`;
            const nextSpy = sinon.spy();
            let freshToken;

            getAuthToken(req, res, nextSpy)
                .then(() => {
                    expect(nextSpy.calledOnce).to.be.true;
                    expect(req.apiAuthToken).to.be.an('string');
                    expect(req.apiAuthToken).not.to.be.empty;
                    freshToken = req.apiAuthToken;

                    return getAuthToken(req, res, nextSpy);
                })
                .then(() => {
                    expect(nextSpy.calledTwice).to.be.true;
                    expect(req.apiAuthToken).to.be.an('string');
                    expect(req.apiAuthToken).not.to.be.empty;
                    expect(req.apiAuthToken).to.be.equal(freshToken);
                    done();
                })
                .catch(done);
        });

        it('should call next() with an error for an invalid sessionToken', done => {
            const req = httpMocks.createRequest(reqOptions);
            req.headers.cookie = 'FTSession_s=invalid';
            const nextSpy = sinon.spy(err => {
                if (err) {
                    throw err;
                }
            });

            getAuthToken(req, res, nextSpy)
                .then(() => {
                    done(new Error('Nothing thrown'));
                })
                .catch(err => {
                    expect(nextSpy.calledOnce).to.be.true;
                    expect(err).to.be.an.instanceof(clientErrors.NotAuthorisedError);

                    done();
                });
        });
    });
});

