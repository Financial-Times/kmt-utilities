const chai = require('chai');
const expect = chai.expect;
const toQueryString = require('../../lib/helpers/toQueryString');

describe('lib/toQueryString', function() {
  //happy path
  it('toQueryString() should return URI encoded string', function (done) {
    let options = {
      q : 'foo',
      orderby : 'asc',
      limit : 3
    }

    let queryString = toQueryString(options);

    expect(queryString).to.be.a('string');
    expect(queryString.charAt(0)).to.equal('?');

    done();
  });
});
