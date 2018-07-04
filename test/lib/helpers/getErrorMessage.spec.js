const expect = require('chai').expect;
const getErrorMessage = require('./../../../lib/helpers/getErrorMessage');

describe('helpers/getErrorMessage', () => {
	it('should return an array', () => {
		const errorMessage = getErrorMessage(404);
		expect(errorMessage).to.be.an('array');
	});

	it('should get a specific error message when it has one for the given status code', () => {
		const errorMessage = getErrorMessage(404);
		expect(errorMessage[0]).to.equal('The page you are trying to access does not exist.');
	});

	it('should get a more generic error message when it cannot find a specific error message for the given status code', () => {
		const errorMessage = getErrorMessage(444);
		expect(errorMessage[0]).to.equal('The page you are trying to access is unavailable.');
	});
});
