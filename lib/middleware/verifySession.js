const logger = require('./../logger');
const config = require('../config');
const uriConstructor = require('./../uriConstructor');
const cookieHandler = require('./../helpers/cookieHandler');
const sessionClient = require('@financial-times/kat-client-proxies').sessionClient;

async function getUserId (req, res, next) {

	const operation = 'verifySession.getUserId';
	logger.info({operation, licenceId: req.params.licenceId});

	// if the session token exists => verify it
	const secureSessionToken = cookieHandler.get(req, res, 'FTSession_s');

	if (!!secureSessionToken) {
		try {
			logger.info({operation, licenceId: req.params.licenceId, msg: 'Verifying the session token'});
			const result = await sessionClient.verify(secureSessionToken);

			logger.info({ operation, licenceId: req.params.licenceId, msg: 'session valid' });
			req.currentUser = result;
			next();
		} catch (error) {
			logger.error({ operation, msg: 'Error validating session token' }, error);
			next(error);
		}
	}


	try {
		const msg = 'No FTSession_s cookie was found. Invalidating any session redirecting to login';
		const logoutUrl = config.LOGOUT_URL;
		const loginUrl = uriConstructor.redirectUrl(req);
		logger.info({ operation, msg, logoutUrl, loginUrl });
		req.session = null;

		// force invalidate the user’s session
		await fetch(logoutUrl, { headers: req.headers });
		res.set('Cache-Control', res.FT_NO_CACHE);
		res.set('Surrogate-Control', res.FT_NO_CACHE);
		res.redirect(loginUrl);
	} catch (error) {
		logger.error({ operation, msg: 'Invalidating user’s session' }, error);
		next(error);
	}
}

module.exports = {
	getUserId
};
