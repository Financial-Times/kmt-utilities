const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-http'));
const { middleware } = require('./../../../index').errors;
const uriConstructor = require('./../../../lib/uriConstructor');

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
        const req = { originalUrl: 'https://kat.ft.com' };

        it('should redirect to the Login page when it is an authenitcation error', done => {
            const constructedRedirectUrl = uriConstructor.redirectUrl(req.originalUrl);
            err.status = 401;

            middleware(err, req, res, next);

            expect(res.redirect.called).to.be.true;
            expect(res.redirect.calledWith(constructedRedirectUrl)).to.be.true;

            done();
        });

        it('should move to the next error middleware function when it is an application error', done => {
            err.status = 500;

            middleware(err, req, res, next);

            expect(next.called).to.be.true;

            done();
        });
    });
});
