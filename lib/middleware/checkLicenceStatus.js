const logger = require('../logger');
const accessLicenceService = require('../services/accessLicenceService');
const acquisitionContextService = require('../services/acquisitionContextService');


module.exports = {

    isActive :function* (req, res, next) {

        try {

            const currentLicence = yield accessLicenceService.getLicenceInfo(req.licenceId);

            if (currentLicence.status !== 'active') {
                logger.info({operation:'checkLicenceStatus', status:currentLicence.status});
                const err = new Error('Licence has been revoked');
                err.status = 403;
                throw err;
            }

            logger.info({operation:'checkLicenceStatus', status:currentLicence.status});

            res.set('Cache-Control', 'private');
            next();

        } catch (err) {
            next(err);
        }
    },

    getLicenceDisplayInfo: function* (req, res, next) {
        try {

            const licenceAcsDetails = yield acquisitionContextService.getAcsDetails(req.licenceId);
            logger.info({operation:'getAcsDetails', licenceName:JSON.stringify(licenceAcsDetails.AcquisitionContext.name)});
            next();

        } catch (err) {
            next(err);
        }
    }

};
