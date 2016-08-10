'use strict';

const logger = require('@financial-times/n-logger').default;
const licenceDataService = require('../services/licenceDataService');

function* getUserList(req, res, next) {

  logger.info({operation:'getUserList'});
  try {
    req.userList = yield licenceDataService.getFilteredUserList(req.licenceId);
    logger.info({operation:'getUserList', result:'success'});
    next();
  } catch (err) {
    logger.error({operation:'getUserList', result:'faliure'});
    next(err);
  }
};

module.exports = getUserList;
