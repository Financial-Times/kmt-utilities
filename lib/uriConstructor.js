const { stringify } = require('querystring');
const logger = require('./logger');

module.exports.redirectUrl = (req) => {

	const loginUrl = 'https://beta-accounts.ft.com/login?';

	logger.info({operation:`redirect to ${loginUrl}`});
	const params = stringify({
		location: encodeURI(`https://${req.hostname}${req.originalUrl}`),
		'mfa-required': 'true'
	});
	return loginUrl + params;

};
