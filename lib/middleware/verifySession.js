const logger = require('./../logger');
const config = require('../config');
const uriConstructor = require('./../uriConstructor');
const cookieHandler = require('./../helpers/cookieHandler');
const sessionClient = require('@financial-times/kat-client-proxies').sessionClient;

function getUserId (req, res, next) {
	const operation = 'verifySession.getUserId';
	const licenceId = req.params.licenceId || req.licenceId;
	logger.info({operation, licenceId});

	// if the session token exists => verify it
	const secureSessionToken = cookieHandler.get(req, res, 'FTSession_s');

	if (!!secureSessionToken) {
		logger.info({operation, licenceId, msg: 'verify the session token'});
		return sessionClient.verify(secureSessionToken)
			.then(result => {
				logger.info({ operation, licenceId, msg: 'session valid' });
				req.currentUser = result;
				next();
			})
			.catch(next);
	}

	logger.info({operation, redirect: 'to accounts.ft.com/login', reason: 'no FTSession found, so bye-bye'});
	req.session = null;

	return fetch(config.LOGOUT_URL, {headers: req.headers})
		.catch(err => err)
		.then(() => {
			res.set('Cache-Control', res.FT_NO_CACHE);
			res.set('Surrogate-Control', res.FT_NO_CACHE);
			res.redirect(uriConstructor.redirectUrl(req));
		});
}

module.exports = {
	getUserId
};
