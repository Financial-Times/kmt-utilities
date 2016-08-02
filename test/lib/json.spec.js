const chai = require('chai');
const expect = chai.expect;
const co = require('co');
const json = require('../../lib/json');

describe('lib/json', function() {
  let response;
  let parsedJson;

  //happy path

  it('parse() should return valid JSON given a response containing valid JSON', function* (done) {
    response = {
      json: function() {
        return JSON.parse('{"foo":"bar"}');
      }
    };

    co(function* () {
      parsedJson = yield json.parse(response);

      expect(parsedJson).to.be.an('object');
      expect(parsedJson.foo).to.be.a('string');
      expect(parsedJson.foo).to.equal('bar');

      done();
    });
  });

  //unhappy path

  it('parse() should throw an exception given a response containing invalid JSON', function(done) {
    response = {
      json: function() {
        return JSON.parse('foobar');
      }
    };

    co(function* () {
      try {
        yield json.parse(response);

      }
      catch (e) {
        expect(e).to.be.an('error');

        done();
      }
    });
  });
});
