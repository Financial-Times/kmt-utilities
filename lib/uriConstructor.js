const { stringify } = require('querystring');
const logger = require('./logger');
const loginUrl = 'https://beta-accounts.ft.com/login?';


module.exports.redirectUrl = (req) => {
	logger.info({operation:`redirect to ${loginUrl}`});
	const params = stringify({
		location: encodeURI(`https://${req.hostname}${req.originalUrl}`),
		'mfa-required': 'true'
	});
	return loginUrl + params;
};