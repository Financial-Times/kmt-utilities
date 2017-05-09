const logger = require('../logger');
const config = require('../config');
const cookieHandler = require('../helpers/cookieHandler');
const sessionClient = require('kat-client-proxies').sessionClient;

module.exports = (req, res, next) => {
    const operation = 'getAuthToken';
    logger.info({operation, licenceId: req.params.licenceId, ignoreAuth: config.IGNORE_AUTH_TOKEN});

    if (config.IGNORE_AUTH_TOKEN === 'true') {
        logger.warn({operation, msg: 'authApi request skipped'});
        return next();
    }

    const FTSessionSecure = cookieHandler.get(req, res, 'FTSession_s') || process.env.SESH_LOCAL;

    new Promise(resolve => {
        return resolve(!!req.apiAuthToken ? req.apiAuthToken : sessionClient.getAuthToken(FTSessionSecure));
    })
    .then(apiAuthToken => {
        logger.info({operation, result: 'success', licenceId: req.params.licenceId});

        req.apiAuthToken = apiAuthToken;
        next();
    })
    .catch(next);
};
