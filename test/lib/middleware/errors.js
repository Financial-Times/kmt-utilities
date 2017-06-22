const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-http'));
chai.use(sinonChai);
const { middleware } = require('./../../../index').errors;
const uriConstructor = require('./../../../lib/uriConstructor');

const config = require('../../../lib/config');

describe('middleware/errors', () => {
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

    describe('middleware()', () => {
        const next = sinon.spy();
        const err = new Error();
        const res = { redirect: sinon.spy() };
        const req = { headers: {}, hostname: 'kat.ft.com', protocol: 'https', originalUrl: '/overview/abc' };

        it('should redirect to the Login page when it is an authentication error', done => {
            const constructedRedirectUrl = uriConstructor.redirectUrl(req);
            err.status = 401;

            let fetchSpy = sinon.spy(global, 'fetch');

            middleware(err, req, res, next).then(() => {
                expect(fetchSpy).to.be.calledWith(config.LOGOUT_URL);

                expect(res.redirect).to.be.calledWith(constructedRedirectUrl);

                fetchSpy.restore();
                done();
            });
        });

        it('should move to the next error middleware function when it is an application error', done => {
            err.status = 500;

            middleware(err, req, res, next);

            expect(next.called).to.be.true;

            done();
        });
    });
});
