//const config = require('../config');
const logger = require('../logger');
const licenceListSort = require('../licenceListSort');
//const cookieSession = require('cookie-session');
const accesslicenceService = require('../services/accesslicenceService');
const licenceDataService = require('../services/licenceDataService');

function* licenceDetails(licenceId, adminUserId) {
  const responses = yield [
      accesslicenceService.getAdministrators(licenceId),
      accesslicenceService.getLicenceList({adminuserid:adminUserId}),
      licenceDataService.getAdminUserList(licenceId)

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

  logger.info({operation:'isAdminUser', licence: req.licenceId});

    try {
      //Does a KMT session exist
      if (req.session.isPopulated) {
          logger.info({operation:'hasKMTSession', kmtSessionExists: 'true', sessionUser:JSON.stringify(req.session.adminUser)});
          next();

      } else if (req.currentUser.uuid) {

        const licenceDetailResponse = yield licenceDetails(req.licenceId, req.currentUser.uuid);
        const adminUserList = licenceDetailResponse[2].administrators;
        const licenceArray = licenceDetailResponse[1].accessLicences;
        const currentUser = req.currentUser.uuid;
        const listOfLicences = licenceListSort(licenceArray);

         //check user is an admin for this licence
         logger.info({operation:'isAdminUser', forLicence:req.licenceId, user:req.currentUser.uuid});

         if (adminUserList.some(user => user.id === currentUser)) {
            logger.info({operation:'isAdminUser', user:currentUser, admin:true});

            let adminUserCreds;
            adminUserList.forEach((item) => {
                if (item.id === currentUser) {
                  adminUserCreds = {
                    'firstName':item.firstName,
                    'lastName':item.lastName,
                  };
                }
            });

            logger.info({operation:'AdminCreds', user:JSON.stringify(adminUserCreds), admin:true});
            //TODO create kmtSession here??? Need to get licence list here
            logger.log('info','sessionStep');
            req.session.adminUser = adminUserCreds;
            req.session.licenceList = listOfLicences;
            logger.log('info',{sessionValue: req.session.value});

            logger.info({operation:'isAdminUser', forLicence:req.params.licenceId, listOfLicence:JSON.stringify(listOfLicences)});
            next();
         }

      } else {
        //missing creds somthings up
        logger.info({operation:'isAdminUser', error:'missing admin list or user uuid'});
        throw new Error('missing licence credentials');
      }

    } catch (err) {
        logger.info({operation:'getLicenceId', result:'failed'});
        next(err);
    }

  }

module.exports = {
    getAdminUserList :getAdminUserList,
    isAdminUser: isAdminUser
};
