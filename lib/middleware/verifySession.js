'use strict';
const sessionService = require('../services/sessionService');
const logger = require('../logger');
const config = require('../config');
const Cookies = require('cookies');
const loginUrl = config.get('LOGIN_URL');


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
  const loginReferrerUrl = encodeURI(req.protocol + '://' + req.get('host') + req.originalUrl);
    const loginRedirect = loginUrl+loginReferrerUrl;
    const FTsessionToken = getSessionCookie(req, res);
    logger.info({operation: 'getUseId', licenceId: req.licenceId});
      if (FTsessionToken) {
        logger.log('info', {ftSessionExists:!!(FTsessionToken)});
        req.currentUser = yield sessionService.verify(FTsessionToken);
        next();
      } else {
        logger.log('info', {operation:'hasFTSession', redirect:loginRedirect, reason:'no FTSession found, so bye-bye'});
        res.redirect(loginRedirect);
      }
}

module.exports = {
    getUserId : getUserId,
    getSessionCookie : getSessionCookie
};
