const logger = require('../logger');
const accessLicenceService = require('../services/accessLicenceService');


module.exports = function* checkLicenceStatus(req, res, next) {

    try {

        const currentLicence = yield accessLicenceService.getLicenceInfo(req.licenceId);

        if (currentLicence.status === 'revoked') {
            logger.info({operation:'checkLicenceStatus', status:currentLicence.status});
            let err = new Error('Licence has been revoked');
            err.status = 403;
            throw err;
        }

        logger.info({operation:'checkLicenceStatus', status:currentLicence.status});
        next();

    } catch (err) {
        next(err);
    }
};
