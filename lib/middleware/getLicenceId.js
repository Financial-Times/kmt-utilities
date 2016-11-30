'use strict';

const logger = require('../logger');

module.exports = function* getLicenceId(req, res, next) {

    try {

      //check licence signature
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(req.params.licenceId)) {
        req.licenceId = req.params.licenceId;
        logger.info({operation:'getLicenceId', licenceId:req.licenceId});
      } else {
        //handle redirect to licence list here
        logger.info({operation:'getLicenceId', result:'invalid licence siganture',licenceIdParam: req.params.licenceId});
      }
      next();

    } catch (err) {
        logger.info({operation:'getLicenceId', result:'failed'});
        next(err)
    }

  };
