const chai = require('chai');
const expect = chai.expect;
const uriFragSplitter = require('../../lib/helpers/uriFragSplitter');

describe('lib/uriFragSplitter', function() {
  //happy path
  it('uriFragSplitter() should return an object of the uri fragment parameters if provided', function (done) {

    let url = 'https://foobar.com/authorize#token_type=Bearer&access_token=abc123foo&scope=aScopeValue.';

    let authObj = uriFragSplitter(url);

    expect(authObj).to.be.an('object');
    expect(Object.keys(authObj).length).to.equal(3);
    expect(authObj.access_token).to.equal('abc123foo');

    done();
  });

  //Sad path :(
   it('uriFragSplitter() should return an object of the uri fragment parameters if provided', function (done) {

    let url = '';

    let authObj = uriFragSplitter(url);

    expect(authObj).to.be.an('undefined');

    done();
  });
});
