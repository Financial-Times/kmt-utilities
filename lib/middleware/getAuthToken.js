const logger = require('../logger');
const config = require('../config');
const apiAuthService = require('../services/apiAuthService');
const cookieHandler = require('../helpers/cookieHandler');

module.exports = function * (req, res, next) {
    logger.info({operation: 'getAuthToken', licenceId: req.params.licenceId, ignoreAuth: config.get('IGNORE_AUTH_TOKEN')});

    //Call apiAuth service here
    try {

        if (config.get('IGNORE_AUTH_TOKEN') === 'true') {
            logger.info({operation: 'getAuthToken', msg: 'autToken call skippped in local'});
            return next();
          }

          const FTSessionSecure = cookieHandler.get(req, res, 'FTSession_s') || process.env.SESH_LOCAL;
          req.apiAuthToken = req.apiAuthToken || (yield apiAuthService.getAuthToken(FTSessionSecure, 'licence_data'));

          if (req.apiAuthToken === null) {
              let err = new Error('Unauthorized');
              err.status = 401;
              throw err;
          }

        logger.info({operation: 'getAuthToken', result: 'sucess', licenceId: req.licenceId});
        next();
    } catch (err) {
        logger.info({operation: 'getAuthToken', result: 'failed', licenceId: req.licenceId});
        next(err);
    }
}