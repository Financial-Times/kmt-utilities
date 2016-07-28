'use strict';

const licenceDataService = require('../services/licenceDataService');
const logger = require('../logger');

function checkIfAdmin(adminDetails, userId) {
  for (let admin of adminDetails.administrators) {
    if (userId && userId === admin.id) {
      return true;
    }
  }
  return false;
}

//verify if the use is an administrator of the licence provided
function* isAdmin(req, res, next) {
  req.adminUsers = yield licenceDataService.getAdminUserList(req.params.licenceId);

  if (checkIfAdmin(req.adminDetails, req.userId)) {
    logger.log('info', 'operation=isAdminUser uuid=%s result=true', req.userId);
    return next();
  }
  let err = new Error('Unauthorised');
  logger.log('warn', 'operation=isAdminUser uuid=%s result=false', req.userId);
  err.status = 403;
  next(err);
}

module.exports = {
    isAdmin: isAdmin
}
