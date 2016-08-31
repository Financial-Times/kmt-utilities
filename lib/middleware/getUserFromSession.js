'use strict';
const logger = require('../logger');
const verifySession = require('./verifySession');

function* getUserFromSession(req, res, next) {
  try {
    req.currentUser = yield verifySession.getUserId(req, res, next);
    if (req.currentUser) {
        logger.info({operation:'getUserFromFTSession',result:'success'});
        next();
    } else {
        logger.info({operation:'getUserFromFTSession',result:'failed'});
        const err = new Error('getUserFromFTSession failed');
        next(err);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = getUserFromSession;
