const logger = require('../logger');
const cookieHandler = require('../helpers/cookieHandler');
const redirectToExistingSession = require('../helpers/redirectToExistingSession');

module.exports = function* getLicenceId(req, res, next) {

    try {
      const licenceList = cookieHandler.getLicenceListCookie(req, res);
        logger.info({operation:'getLicenceId', licenceList:JSON.stringify(licenceList || [])});
      //check licence signature
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(req.params.licenceId)) {
        req.licenceId = req.params.licenceId;
        logger.info({operation:'getLicenceId', licenceId:req.licenceId});
        next();
      } else if (req.session.isPopulated && licenceList && req.currentUser) {
        //redirect here
        logger.info({operation:'getLicenceId', msg:'attempt to redirect to defalut licence'});
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
