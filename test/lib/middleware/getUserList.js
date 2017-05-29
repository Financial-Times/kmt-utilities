const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const expect = require("chai").expect;
const nock = require('nock');
const httpMocks = require('node-mocks-http');
const config = require('kat-client-proxies/lib/helpers/config');
const expectOwnProperties = require('kat-client-proxies/test/helpers/expectExtensions').expectOwnProperties;
const uuids = require('kat-client-proxies/test/mocks/uuids');
const mockAPI = require('kat-client-proxies/test/helpers/env').USE_MOCK_API;
const {getUserList} = require('./../../../index');

describe('middleware/getUserList', () => {
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

    const endpoint = '/get-user-list';

    const req = httpMocks.createRequest({
        method: 'POST',
        url: `${endpoint}`
    });
    const res = httpMocks.createResponse();

    it('should get the list of users for a valid licence ID', done => {
        if (mockAPI) {
            nock(`${config.API_GATEWAY_HOST}/licence-seat-holders`)
                .get(`/${uuids.validLicence}`)
                .reply(200, () => require('kat-client-proxies/test/mocks/fixtures/licenceSeatHolders'));
        }

        req.licenceId = uuids.validLicence;
        const nextSpy = sinon.spy();

        getUserList(req, res, nextSpy)
            .then(() => {
                expect(nextSpy.calledOnce).to.be.true;

                const userList = req.userList;
                expect(userList).to.be.an('array');
                if (userList.length > 0) {
                    expectOwnProperties(userList, ['id', 'lastName', 'firstName', 'email', 'joinedDate']);
                }

                done();
            })
            .catch(done);
    });

    it('should throw an error for an invalid licence ID', done => {
        if (mockAPI) {
            nock(`${config.API_GATEWAY_HOST}/licence-seat-holders`)
                .get(`/${uuids.invalidLicence}`)
                .reply(404, () => null);
        }

        req.licenceId = uuids.invalidLicence;
        const nextSpy = sinon.spy(err => {
            if (err) {
                throw err;
            }
        });

        getUserList(req, res, nextSpy)
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

