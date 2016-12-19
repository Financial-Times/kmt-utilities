const logger = require('../logger');
const apiAuthService = require('../services/apiAuthService');
const cookieHandler = require('../helpers/cookieHandler');

module.exports = function* (req, res, next) {
  logger.info({operation: 'getAuthToken', licenceId: req.params.licenceId});
  const FTSessionSecure = cookieHandler.get(req, res, 'FTSession_s') ||  process.env.SESH_LOCAL;

  logger.info({operation:'getAuthHeader'});

  //Call apiAuth service here
    try {
      req.apiAuthToken = req.apiAuthToken || (yield apiAuthService.getAuthToken(FTSessionSecure, 'licence_data'));

      logger.info({operation:'getAuthToken', result:'sucess', licenceId:req.licenceId});
      next();
    } catch (err) {
      logger.info({operation:'getAuthToken', result:'failed', licenceId:req.licenceId});
      next(err);
    }
}