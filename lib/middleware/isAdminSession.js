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

function _setLicenceListObj(res, listOfLicences) {
  logger.log('info', {operation:'setLicenceListObj'});
  //set KATLicence list cookie
  res.cookie('FTKatL', JSON.stringify(listOfLicences), { expires: new Date(Date.now() + 2 * 60 * 1000)});
}

function setKATConfig(req, listOfLicences) {
    logger.info({operation:'setKMTConfig', result:'success'});
    return Object.assign({}, req.session.kmtLoggedIn,{licenceList:listOfLicences});
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

  const currentUser = req.currentUser.uuid;
  let listOfLicences = cookieHandler.getLicenceListCookie(req, res);

  logger.info({operation:'isAdminUser', licence: req.licenceId});

    try {
      //Does KMT sessions exist
      logger.info({operation:'DoesKMTsessions exist', user: currentUser});
      logger.info({operation:'DoesKMThaveLicences', kmtLicences: listOfLicences});
      //TODO why is res.cookie.FTKatL not getting read here?!?
      if (req.session.isPopulated && Array.isArray(listOfLicences) && isLicenceInList(listOfLicences, req.licenceId)) {
          logger.info({operation:'isAdminUser', kmtSessionExists: 'true', sessionValue: cookieHandler.getKatCookie(req, res)});
          logger.info({operation:'isAdminUser', licenceExistsInSession:true});
          logger.info({operation:'licenceListFresh', licenceListFresh:req.cookies});

      } else if (req.session.isPopulated && !req.cookies.FTKatL) {
        logger.info({operation:'no licence cookie', licenceListFresh:false});
        const licenceDetailResponse = yield _licenceDetails(req.licenceId, currentUser);
        listOfLicences = licenceListSort(licenceDetailResponse[1].accessLicences);

      } else if (currentUser) {

        const licenceDetailResponse = yield _licenceDetails(req.licenceId, currentUser);
        const adminUserList = licenceDetailResponse[2].administrators;
        listOfLicences = licenceListSort(licenceDetailResponse[1].accessLicences);

         //check user is an admin for this licence
        logger.info({operation:'isAdminUser', licenceId:req.licenceId, user:currentUser});

        if (!adminUserList.some(user => user.id === currentUser)) {
            //Not an admin user.
            const err = new Error('Current user is not an admin user on this licence');
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

        //set KAT session
        req.session.kmtLoggedIn = Object.assign({}, {displayName:adminUser},{userId:currentUser});
        logger.info({operation:'KMTSessionSet', forLicence:req.params.licenceId, loggedInLicenceListSet:true});

      } else {
        //missing creds somthings up
        logger.info({operation:'isAdminUser', error:'missing admin list or user uuid'});
        throw new Error('Missing licence credentials');
      }

      //Create KATConfig object to pass to FE
      req.KATConfig = setKATConfig(req, listOfLicences);
      _setLicenceListObj(res, listOfLicences);

      logger.info({operation:'KATConfig', KATConfig:JSON.stringify(req.KATConfig)});
      next();

    } catch (err) {
        logger.info({operation:'getLicenceId', result:'failed'});
        next(err);
    }

  }

module.exports = {
    getAdminUserList :getAdminUserList,
    isAdminUser: isAdminUser
};
