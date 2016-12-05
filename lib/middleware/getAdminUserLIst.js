'use strict';

const logger = require('../logger');
const licenceDataService = require('../services/licenceDataService');

function* getAdminUserList(req, res, next) {

  try {
    req.adminUserList = yield licenceDataService.getAdminUserList(req.licenceId);

    logger.info({operation:'getAdminUserList', licenceId:req.licenceId});
    next();
  } catch (err) {
    logger.info({operation:'getAdminUserList', result:'failed'});
    next(err);
  }
};

module.exports = getAdminUserList;
