const logger = require('../logger');
const licenceListSort = require('../licenceListSort');
const accessLicenceService = require('../services/accessLicenceService');
const licenceDataService = require('../services/licenceDataService');

function* licenceDetails(licenceId, adminUserId) {
  const responses = yield [
      accessLicenceService.getAdministrators(licenceId),
      accessLicenceService.getLicenceList({adminuserid:adminUserId}),
      licenceDataService.getAdminUserList(licenceId)

  ];
  return responses;
}

function* getAdminUserList(req, res, next) {

  logger.info({operation:'getAdminUserList', requestParams:JSON.stringify(req.params)});

  try {
    req.adminUserList = yield accessLicenceService.getAdministrators(req.licenceId);

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

        if (!adminUserList.some(user => user.id === currentUser)) {
            //Not an admin user.
            const err = new Error('Current user is not an admin user');
            err.status = 403;
            throw err;
        }

        logger.info({operation:'isAdminUser', admin:true});

        let adminUser;

        adminUserList.forEach((item) => {
            if (item.id === currentUser) {
              adminUser = item.email;
            }
        });

        req.session.kmtLoggedIn = Object.assign({}, {displayName:adminUser}, {licenceList:listOfLicences});
        logger.info({operation:'KMTSessionSet', forLicence:req.params.licenceId, loggedInLicenceList:JSON.stringify(req.session.kmtLoggedIn.licenceList)});
        next();

      } else {
        //missing creds somthings up
        logger.info({operation:'isAdminUser', error:'missing admin list or user uuid'});
        throw new Error('Missing licence credentials');
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
