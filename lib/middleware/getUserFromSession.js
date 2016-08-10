'use strict';
const logger = require('@financial-times/n-logger').default;
const verifySession = require('./verifySession');

function* getUserFromSession(req, res, next) {
  try {
    req.currentUser = yield verifySession.getUserId(req, res, next);
    logger.info({operation:'getUserFromFTSession',result:'success'});
    next();
  } catch (err) {
    logger.info({operation:'getUserFromFTSession',result:'failed'});
    next(err);
  }
};

module.exports = getUserFromSession;
