var chai = require('chai');
var expect = chai.expect;
var co = require('co');
var json = require('../../lib/json');

describe('lib/json', function() {
  var response,
    parsedJson;

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
        expect(e.message).to.be.a('string');
        expect(e.message).to.equal('Unexpected token o');

        done();
      }
    });
  });
});
