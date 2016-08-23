//const config = require('../config');
const logger = require('../logger');
const accesslicenceService = require('../services/accesslicenceService');

function* getAdminUserList(req, res, next) {

     logger.info({operation:'getAdminUserList', requestParams:JSON.stringify(req.params)});

  try {
    req.adminUserList = yield accesslicenceService.getAdministrators('5589c139-f49e-4344-8132-c51aadda7a8b');

    logger.info({operation:'getAdminUserList', licenceId:req.licenceId, adminUsers: req.adminUserList});
    next();
  } catch (err) {
    logger.info({operation:'getAdminUserList', result:'failed'});
    next(err);
  }
};

module.exports = {
    getAdminUserList :getAdminUserList
}
