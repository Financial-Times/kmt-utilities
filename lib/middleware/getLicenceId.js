const logger = require('../logger');
const redirectToExistingSession = require('../helpers/redirectToExistingSession');
const accessLicenceService = require('../services/accessLicenceService');

module.exports = function* getLicenceId(req, res, next) {

    try {
      //check licence signature
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(req.params.licenceId)) {
        req.licenceId = req.params.licenceId;
        logger.info({operation:'getLicenceId', licenceId:req.licenceId});
        next();
      } else if (req.session.isPopulated && req.currentUser) {
        //redirect here
        logger.info({operation:'getLicenceId', msg:'attempt to redirect to defalut licence'});
        //retreive the licence listOfLicence
        let licenceList = yield accessLicenceService.getLicenceList({adminuserid:req.currentUser.uuid});
        redirectToExistingSession(req, res, licenceList);
      } else {
        logger.info({operation:'getLicenceId', result:'invalid licenceId',licenceIdParam: req.params.licenceId});
        const err = new Error('You need to have a valid license identifier to use this tool');
        err.status = 404;
        throw err;
      }
      //next();

    } catch (err) {
        logger.info({operation:'getLicenceId', result:'failed'});
        next(err)
    }

  };
