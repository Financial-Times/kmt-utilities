const logger = require('../logger');
const accessLicenceService = require('../services/accessLicenceService');
const cookieHandler = require('../helpers/cookieHandler');
const acquisitionContextService = require('../services/acquisitionContextService');

function updateLicenceList(req, res) {
  let licenceList = cookieHandler.getLicenceListCookie(req, res);


  if (licenceList && licenceList.length >= 0) {
    logger.info({operation:' 👉  updateLicenceList', licenceId:req.licenceId, isLicenceListArray: licenceList.length});
    //if licenceList exists and has properties return the array without the current licenceId
      licenceList = licenceList.filter((item) => {
        if (item.licenceId !== req.licenceId) {
        return item;
        }
    });

    //decorate the request with the next licenceId in the list
    req.licenceId = licenceList[0].licenceId;
    logger.info({operation:' 👀  updateLicenceList', licenceId:req.licenceId, isLicenceListArray: licenceList.length});
    //set req.licenceId to be the first licence in the cached listOfLicence
    //recursivelly call isActive until an active licence is found that is active
    //this.isActive(req, res, next);

  } else {
    const err = new Error('Licence has been revoked');
    err.status = 403;
    throw err;
  }
}

function* isActive(req, res, next) {
    try {

        const currentLicence = yield accessLicenceService.getLicenceInfo(req.licenceId);
        logger.info({operation:'checkLicenceStatus', status:currentLicence.status});
        if (currentLicence.status !== 'active') {
          //Check if currentLicence is in cached listOfLicences
          updateLicenceList(req, res);
          }

        res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        next();

    } catch (err) {
        next(err);
    }
}

function* getLicenceDisplayInfo(req, res, next) {
  try {

      const licenceAcsDetails = yield acquisitionContextService.getAcsDetails(req.licenceId);
      logger.info({operation:'getAcsDetails', licenceName:JSON.stringify(licenceAcsDetails.AcquisitionContext.name)});
      next();

  } catch (err) {
      next(err);
  }

}

module.exports = {
    isActive,
    getLicenceDisplayInfo
};
