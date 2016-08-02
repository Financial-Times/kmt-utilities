'use strict';
const logger = require('./../logger');
const verifySession = require('./verifySession');

function* getUserFromSession(req, res, next) {

  logger.log('info', 'Retrieve admin user from session called');

  try {
    req.currentUser = yield verifySession.getUserId(req, res, next);
    logger.log('info', 'operation=getUserFromFTSession user=%s result=success', req.currentUser);
    next();
  } catch (err) {
    logger.log('info', 'operation=getUserFromFTSession result=failed');
    next(err);
  }
};

module.exports = getUserFromSession;
