const logger = require('./../logger');
const config = require('../config');
const uriConstructor = require('./../uriConstructor');
const cookieHandler = require('./../helpers/cookieHandler');
const sessionClient = require('@financial-times/kat-client-proxies').sessionClient;

function getUserId (req, res, next) {
	const operation = 'verifySession.getUserId';
	logger.info({operation, licenceId: req.params.licenceId});

	// if the session token exists => verify it
	if (res.locals && res.locals.flags && res.locals.flags.kat2fa) { //TODO delete this block when 2fa becomes default in next major version
		const secureSessionToken = cookieHandler.get(req, res, 'FTSession_s');
		if (!!secureSessionToken) {
			logger.info({operation, licenceId: req.params.licenceId, msg: 'verify the session token'});
			return sessionClient.verify(secureSessionToken, res.locals.flags)
				.then(result => {
					logger.info({ operation, licenceId: req.params.licenceId, msg: 'session valid' });
					req.currentUser = result;
					next();
				})
				.catch(next);
		}
	} else {
		const FTsessionToken = cookieHandler.get(req, res, 'FTSession');
		if (!!FTsessionToken) {
			logger.info({ operation, licenceId: req.params.licenceId, msg: 'verify the session token' });
			return sessionClient.verify(FTsessionToken)
				.then(result => {
					logger.info({ operation, licenceId: req.params.licenceId, msg: 'session valid' });
					req.currentUser = result;
					next();
				})
				.catch(next);
		}
	}

	logger.info({operation, redirect: 'to accounts.ft.com/login', reason: 'no FTSession found, so bye-bye'});
	req.session = null;

	return fetch(config.LOGOUT_URL, {headers: req.headers})
		.catch(err => err)
		.then(() => {
			res.redirect(uriConstructor.redirectUrl(req, res));
		});
}

module.exports = {
	getUserId
};
