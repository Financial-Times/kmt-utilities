'use strict';
const sessionService = require('../services/sessionService');
const logger = require('@financial-times/n-logger').default;
const Cookies = require('cookies');


function getSessionCookie(req, res) {
  const cookieHandler = new Cookies(req, res);
  let ftSessionCookie = cookieHandler.get('FTSession');
  if (!ftSessionCookie) {
    logger.warn({operation:'getFTSession', error :'Could not find FTSession cookie'});
    throw new Error('Could not find FTSession cookie');
  }
  logger.info({operation: 'getFTSession', FTSessionExsits: 'true'});
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

module.exports = {
    getUserId : getUserId
}
