'use strict';
const sessionService = require('../services/sessionService');
const logger = require('../logger');
const uriConstructor = require('../uriConstructor');
const cookieHandler = require('../helpers/cookieHandler');

function* getUserId(req, res, next) {
    const FTsessionToken = cookieHandler.get(req, res, 'FTSession');

    logger.info({operation: 'getUseId', licenceId: req.params.licenceId});
      if (FTsessionToken) {
        logger.log('info', {ftSessionExists:!!(FTsessionToken)});
        req.currentUser = yield sessionService.verify(FTsessionToken);
        next();
      } else {
        logger.log('info', {operation:'getUserId', redirect:'to accounts.ft.com/login', reason:'no FTSession found, so bye-bye'});
        if (req.session) {
          req.session = null
        }
        res.redirect(uriConstructor.redirectUrl(req.originalUrl));
      }
}

module.exports = {
    getUserId : getUserId
};
