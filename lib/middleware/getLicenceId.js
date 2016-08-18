'use strict';

const logger = require('../logger');

module.exports = function* getLicenceId(req, res, next) {

    try {
      req.licenceId = req.params.licenceId;

      logger.info({operation:'getLicenceId', licenceId:req.params.licenceId});
      next();

    } catch (err) {
        logger.info({operation:'getLicenceId', result:'failed'});
        next(err)
    }

  };
