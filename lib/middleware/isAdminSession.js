const logger = require('../logger');
const licenceListSort = require('../licenceListSort');
const isLicenceInList = require('../helpers/isLicenceInList');
const accessLicenceService = require('../services/accessLicenceService');
const licenceDataService = require('../services/licenceDataService');
const cookieHandler = require('../helpers/cookieHandler');

function* _licenceDetails(licenceId, adminUserId) {
  const responses = yield [
      accessLicenceService.getAdministrators(licenceId),
      accessLicenceService.getLicenceList({adminuserid:adminUserId}),
      licenceDataService.getAdminUserList(licenceId)
    ];
  return responses;
}

function setKATConfig(req, licenceList) {
    logger.info({operation:'setKATConfig', result:'success'});
    return Object.assign({}, req.session.kmtLoggedIn, {licenceList:licenceList});
}

function* getAdminUserList(req, res, next) {

  logger.info({operation:'getAdminUserList', requestParams:JSON.stringify(req.params)});

  try {
    req.adminUserList = yield accessLicenceService.getAdministrators(req.licenceId);

    logger.info({operation:'getAdminUserList', licenceId:req.licenceId, adminUsers: req.adminUserList});
    next();
  } catch (err) {
    logger.info({operation:'getAdminUserList', result:'failed', licenceId:req.licenceId});
    next(err);
  }
}

function* isAdminUser(req, res, next) {

  const currentUser = req.currentUser.uuid;
  let licenceList = cookieHandler.getLicenceListCookie(req, res);

  logger.info({operation:'isAdminUser', licence: req.licenceId, user: currentUser});

    try {
      //Does KMT sessions and fresh licenceList exist
      if (req.session.isPopulated && Array.isArray(licenceList) && isLicenceInList(licenceList, req.licenceId)) {
          logger.info({operation:'isAdminUser', FTKatSessionExist:req.session.isPopulated, licenceList: licenceList});

      } else if (req.session.isPopulated && !req.cookies.FTKatL) {
        logger.info({operation:'isAdminUser', licenceListFresh:false});
        //update licenceList details
        const licenceDetailResponse = yield _licenceDetails(req.licenceId, currentUser);
        licenceList = licenceListSort(licenceDetailResponse[1].accessLicences);

      } else if (currentUser) {
        //get licence details
        const licenceDetailResponse = yield _licenceDetails(req.licenceId, currentUser);
        const adminUserList = licenceDetailResponse[2].administrators;
        licenceList = licenceListSort(licenceDetailResponse[1].accessLicences);

         //check user is an admin for this licence
        if (!adminUserList.some(user => user.id === currentUser)) {
            //Not an admin user.
            const err = new Error(`userId:${currentUser} is not an admin user on this licence`);
            err.status = 403;
            throw err;
        }

        let adminUser;

        adminUserList.forEach((item) => {
            if (item.id === currentUser) {
              adminUser = item.email;
            }
        });

        //set KAT session
        req.session.kmtLoggedIn = Object.assign({}, {displayName:adminUser},{userId:currentUser});
        logger.info({operation:'KATSessionSet', licenceId:req.params.licenceId, userId:currentUser});

      } else {
        //missing creds somthings up
        logger.info({operation:'isAdminUser', error:'missing admin list or user uuid'});
        throw new Error('Missing licence credentials');
      }

      //Set KATConfig object to pass to FE
      req.KATConfig = setKATConfig(req, licenceList);
      cookieHandler.setLicenceListCookie(req, res, licenceList);
      next();

    } catch (err) {
        logger.info({operation:'isAdminUser', result:'failed', licenceId:req.params.licenceId, userId:currentUser});
        next(err);
    }

  }

module.exports = {
    getAdminUserList :getAdminUserList,
    isAdminUser: isAdminUser
};
