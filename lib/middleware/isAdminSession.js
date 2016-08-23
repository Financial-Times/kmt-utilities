//const config = require('../config');
const logger = require('../logger');
const licenceListSort = require('../licenceListSort');
//const cookieSession = require('cookie-session');
const accesslicenceService = require('../services/accesslicenceService');

function* licenceDetails(licenceId, adminUserId) {
  let responses = yield [
      accesslicenceService.getAdministrators(licenceId),
      accesslicenceService.getLicenceList({adminuserid:adminUserId})
  ];
  return responses;
}

function* getAdminUserList(req, res, next) {

     logger.info({operation:'getAdminUserList', requestParams:JSON.stringify(req.params)});

  try {
    req.adminUserList = yield accesslicenceService.getAdministrators(req.licenceId);

    logger.info({operation:'getAdminUserList', licenceId:req.licenceId, adminUsers: req.adminUserList});
    next();
  } catch (err) {
    logger.info({operation:'getAdminUserList', result:'failed'});
    next(err);
  }
};

function* isAdminUser(req, res, next) {

  logger.info({operation:'isAdminUser', reqPath:req.path, user:req.currentUser.uuid, licence: req.params.licenceId});

    try {

      if (req.kmtSession) {
          logger.info({operation:'isAdminUser', sessionStatus:'KMT Session is set happy days'});
          next();

      } else if (req.currentUser.uuid) {

        //TODO Why is the req.params returning empty??? Remove line below
        req.licenceId='5589c139-f49e-4344-8132-c51aadda7a8b';

        const accessLicenceResponse = yield licenceDetails(req.licenceId, req.currentUser.uuid);
        const adminUserList = accessLicenceResponse[0].administrators;
        const licenceArray = accessLicenceResponse[1].accessLicences;
        //const adminUsers = adminUserList.administrators;
        const currentUser = req.currentUser.uuid;
        const listOfLicences = licenceListSort(licenceArray);
         //Does a KMT session exist
         //check user is an admin for this licence
         logger.info({operation:'isAdminUser', forLicence:req.licenceId, user:req.currentUser.uuid});
         if (adminUserList.some(user => user.userId === currentUser)) {
            logger.info({operation:'isAdminUser', user:currentUser, admin:true});
            //TODO create kmtSession here??? Need to get licence list here

            logger.info({operation:'isAdminUser', forLicence:req.licenceId, listOfLicence:JSON.stringify(listOfLicences)});
            next();
         }

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
