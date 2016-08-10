'use strict';

const logger = require('@financial-times/n-logger').default;
const licenceDataService = require('../services/licenceDataService');

function* getAdminUserList(req, res, next) {

  //kmtUtil.logger.log('info', 'retrieve user from session called');
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
