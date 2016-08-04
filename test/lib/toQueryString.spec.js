const chai = require('chai');
const expect = chai.expect;
const toQueryString = require('../../lib/toQueryString');

describe('lib/toQueryString', function() {
  //happy path
  it('toQueryString() should return URI encoded string', function (done) {
    let options = {
      q : 'foo',
      orderby : 'asc',
      limit : 3
    }

    let queryString = toQueryString(options);
    console.log(queryString);

    expect(queryString).to.be.a('string');

    done();
  });
});
