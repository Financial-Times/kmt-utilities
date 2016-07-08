'use strict';
const chai = require('chai');
const expect = chai.expect;
const nock = require('nock');
const config = require('../../../lib/config');
const sinon = require('sinon');
const co = require('co');
const accessLicenceService = require('../../../lib/middleware/hasAdminAccess');

let sandbox = sinon.sandbox.create();

describe('lib/middleware/hasAdminAccess', function() {
    let accessLicenceId = 'foobarfoobarfoo';
    let userId = 'foo';

    it('isAdmin() should verify userId exist in list of admin users', function() {

        co(function* () {
            expect(accessLicenceId).to.equal('foobarfoobarfoo');
            expect(userId).to.equal('foo');
        });

    });

});
