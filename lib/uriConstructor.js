const { stringify } = require('querystring');
const logger = require('./logger');

module.exports.redirectUrl = (req, res) => {

	if (res.locals && res.locals.flags && res.locals.flags.kat2fa) {
		const loginUrl = 'https://beta-accounts.ft.com/login?';

		logger.info({operation:`redirect to ${loginUrl}`});
		const params = stringify({
			location: encodeURI(`https://${req.hostname}${req.originalUrl}`),
			'mfa-required': 'true'
		});
		return loginUrl + params;

	} else { //TODO delete this block when 2fa becomes default in next major version
		const loginUrl = 'https://accounts.ft.com/login?location=';

		logger.info({ operation: `redirect to ${loginUrl}` });
		const loginReferrerUrl = encodeURI(`https://${req.hostname}${req.originalUrl}`);
		return loginUrl + loginReferrerUrl;
	}
};
