'use strict';

const logger = require('./../logger');

function* getLicenceId(req, res, next) {

    try {
      req.licenceId = req.params.licenceId;

      logger.log('info','operation=getLicenceId uuid=%s result=success', req.params.licenceId);
      next();

    } catch (err) {
        logger.log('info','operation=getLicenceId uuid=%s result=failure', req.params.licenceId);
        next(err)
    }

  }

module.exports = getLicenceId;
