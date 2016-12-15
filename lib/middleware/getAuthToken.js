const logger = require('../logger');
const apiAuthService = require('../services/apiAuthService');
const cookieHandler = require('../helpers/cookieHandler');

module.exports = function* (req, res, next) {
  logger.info({operation: 'getAuthToken', licenceId: req.params.licenceId});
  const FTSessionSecure = cookieHandler.get(req, res, 'FTSession_s');

  logger.info({operation:'addAuthHeader'});

  //Call apiAuth service here
    try {
      req.authToken = yield apiAuthService.getAuthToken(FTSessionSecure);
      next();
    } catch (err) {
      logger.info({operation:'getAuthToken', result:'failed', licenceId:req.licenceId});
      next(err);
    }
}