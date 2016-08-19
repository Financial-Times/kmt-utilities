'use strict';
const sessionService = require('../services/sessionService');
const logger = require('../logger');
const config = require('../config');
const Cookies = require('cookies');
const loginUrl = config.get('LOGIN_URL');


function getSessionCookie(req, res, name) {
  const cookieHandler = new Cookies(req, res);
  let ftSessionCookie = cookieHandler.get(name);
  if (!ftSessionCookie) {
    logger.info({operation:'getFTSession', cookeRequested:name, result:'cookie does not exist'});
    return;
  }
  logger.info({operation: 'getFTSession',cookeRequested:name, result: 'FTSession cookie exists'});
  return ftSessionCookie;
}

function* getUserId(req, res, next) {
  console.log(req.params.licenceId);
   logger.info({operation: 'getUseId', licenceId: req.params.licenceId});
    let sessionId = getSessionCookie(req, res);
    if (sessionId) {
        return yield sessionService.verify(sessionId);
        logger.info({operation: 'getUseId', success: 'true'});
    } else {
      throw new Error('something when wrong');
    }
}

function* hasFTSession(req, res, next) {
    const loginReferrerUrl = encodeURI(req.protocol + '://' + req.get('host') + req.originalUrl);
    const loginRedirect = loginUrl+loginReferrerUrl;
    const FTsessionToken = getSessionCookie(req, res, 'FTSession');
      if (FTsessionToken) {
        logger.log('info', {ftSessionExists:!!(FTsessionToken)});
        req.FTSession = FTsessionToken;
        next();
      } else {
        logger.log('info', {redirect:loginRedirect, reason:'no FTSession found, so bye-bye'});
        res.redirect(loginRedirect);
      }
}

module.exports = {
    getUserId : getUserId,
    getSessionCookie : getSessionCookie,
    hasFTSession: hasFTSession
}
