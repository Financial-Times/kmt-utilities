'use strict';

const logger = require('../logger');
const licenceDataService = require('../services/licenceDataService');

function* getUserList(req, res, next) {

  logger.log('info', 'retrieve user from session called');
  try {
    req.userList = yield licenceDataService.getFilteredUserList(req.licenceId);
    logger.log('info', 'Retrieve users from lDS for  licence=s%', req.userList);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = getUserList;
