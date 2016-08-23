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

function* isAdminUser(req, res, next) {

    try {

      if (req.kmtSession) {
          logger.info({operation:'isAdminUser', sessionStatus:'KMT Session is set happy days'});
          next();

      } else if (req.adminUserList && req.currentUser.uuid) {
         //Does a KMT session exist
         //check user is an admin for this licence
         logger.info({operation:'isAdminUser', adminUserList:JSON.stringify(req.adminUserList), user:req.currentUser.uuid});
         next();
        //TODO set kmtSession here??? Need to get licence list here


      } else {
        //missing creds somthings up
        logger.info({operation:'isAdminUser', error:'missing admin list or user uuid'});
        throw new Error('missing licence credentials');
      }

    } catch (err) {
        logger.info({operation:'getLicenceId', result:'failed'});
        next(err)
    }

  }

module.exports = {
    getAdminUserList :getAdminUserList,
    isAdminUser: isAdminUser
}
