'use strict';
const sessionService = require('../services/sessionService');
const logger = require('../logger');
const uriConstructor = require('../uriConstructor');
const Cookies = require('cookies');

function getSessionCookie(req, res) {
  const cookieHandler = new Cookies(req, res);
  const ftSessionCookie = cookieHandler.get('FTSession');
  if (!ftSessionCookie) {
    logger.info({operation:'getFTSession', result:'FTSession cookie does not exist'});
    return;
  }
  logger.info({operation: 'getFTSession', result: 'FTSession cookie exists'});
  return ftSessionCookie;
}

function* getUserId(req, res, next) {
    //const loginRedirect = uriConstructor.redirectUrl(req.originalUrl);
    const FTsessionToken = getSessionCookie(req, res);
    logger.info({operation: 'getUseId', licenceId: req.licenceId});
      if (FTsessionToken) {
        logger.log('info', {ftSessionExists:!!(FTsessionToken)});
        req.currentUser = yield sessionService.verify(FTsessionToken);
        next();
      } else {
        logger.log('info', {operation:'getUserId', redirect:'to accounts.ft.com/login', reason:'no FTSession found, so bye-bye'});
        res.redirect(uriConstructor.redirectUrl(req.originalUrl));
      }
}

module.exports = {
    getUserId : getUserId,
    getSessionCookie : getSessionCookie
};
