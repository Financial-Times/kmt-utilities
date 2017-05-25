const logger = require('./../../../lib/logger');
const sinon = require('sinon');
const chai = require("chai");
const expect = chai.expect;
chai.use(require('chai-http'));
const request = chai.request;
const express = require('express');
const {textOrJson} = require('./../../../lib/middleware/bodyParser');

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
        logMessageStub.restore();

        done();
    });

    const app = express();

    describe('middleware/bodyParser', () => {
        const endpoint = '/body-parser';
        const textOrJsonEndpoint = `${endpoint}/text-or-json`;
        const textOrJsonErrorEndpoint = `${textOrJsonEndpoint}/error`;

        app.post(textOrJsonEndpoint, textOrJson, (req, res) => res.send(req.body));
        app.post(textOrJsonErrorEndpoint, (req, res, next) => textOrJson(req, res, next, true));

        const sentBody = {
            nps: 5,
            comment: 'Test'
        };
        const bodyStr = JSON.stringify(sentBody);

        it('should parse the JSON body sent', done => {
            request(app)
                .post(textOrJsonEndpoint)
                .send(sentBody)
                .set('Content-Type', 'application/json')
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body).to.be.an('object');
                    expect(res.text).to.equal(bodyStr);

                    done();
                });

        });

        it('should parse the string body sent', done => {
            request(app)
                .post(textOrJsonEndpoint)
                .send(bodyStr)
                .set('Content-Type', 'text/plain')
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    expect(res.text).to.equal(bodyStr);

                    done();
                });

        });

        it('should not throw an error when receiving unsupported request body format', done => {
            request(app)
                .post(textOrJsonEndpoint)
                .send(bodyStr)
                .set('Content-Type', 'image/svg+xml')
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    expect(res.text).to.be.empty;

                    done();
                });

        });

        it('should throw an error when receiving unsupported request body format', done => {
            request(app)
                .post(textOrJsonErrorEndpoint)
                .send(bodyStr)
                .set('Content-Type', 'image/svg+xml')
                .end((err, res) => {
                    expect(err.status).to.equal(400);
                    expect(res.status).to.equal(400);

                    done();
                });

        });
    });
});
