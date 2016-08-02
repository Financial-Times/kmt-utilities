'use strict';

const licenceDataService = require('../services/licenceDataService');

function* getAdminUserList(req, res, next) {

  //kmtUtil.logger.log('info', 'retrieve user from session called');
  try {
    req.adminUserList = yield licenceDataService.getAdminUserList(req.licenceId);
    //kmtUtil.logger.log('info', 'Retrieve Admin users from lDS for  licence=s%', req.adminUserList);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = getAdminUserList;
