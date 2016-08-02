'use strict';

function* isAdminUser(req, res, next) {
  let licenceAdminList = req.adminUserList.administrators;
  let currentUserId = req.currentUser.uuid;

  for (let admin of licenceAdminList) {
    if (currentUserId && currentUserId === admin.id) {
        req.adminCredentials = admin;
        next();
      } else {
          let err = new Error('Unauthorised');
          err.status = 403;
          next(err);
      }
  }
};

module.exports = isAdminUser;
