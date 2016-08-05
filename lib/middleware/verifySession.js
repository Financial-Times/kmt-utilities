'use strict';
const sessionService = require('../services/sessionService');
const logger = require('../logger');
const Cookies = require('cookies');


function getSessionCookie(req, res) {
  const cookieHandler = new Cookies(req, res);
  let ftSessionCookie = cookieHandler.get('FTSession');
  if (!ftSessionCookie) {
    logger.log('warn', 'operation=getFTSession error=Could not find FTSession cookie');
    throw new Error('Could not find FTSession cookie');
  }
  logger.log('info', 'operation=getFTSession FTSessionExsits=true');
  return ftSessionCookie;
}

function* getUserId(req, res, next) {
   logger.log('info', 'operation=getUseId for licenceAdmin=s%', req.params.licenceId);
    let sessionId = getSessionCookie(req, res);
    if (sessionId) {
        return yield sessionService.verify(sessionId);
        logger.log('info', 'user=s%', req.user.uuid);
    } else {
      throw new Error('something when wrong');
    }
}

module.exports = {
    getUserId : getUserId
}
