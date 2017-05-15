const logger = require('../logger');
const proxies = require('kat-client-proxies');
const accessLicenceClient = proxies.accessLicenceClient;
const acquisitionCtxClient = proxies.acquisitionCtxClient;
const getListOfLicences = require('./getListOfLicences');

function _goToNextLicence(req, res) {
    const operation = 'goToNextLicence';
    logger.info({operation, licenceId: req.licenceId});

    return getListOfLicences(req)
        .then(() => {
            logger.info({operation, licenceId: req.licenceId, isLicenceListArray: req.listOfLicences.length});

            let newLicence = undefined;
            req.listOfLicences.every(item => {
                if (item.licenceId !== req.licenceId) {
                    newLicence = item.licenceId;
                    return false;
                }
                return true;
            });

            if (newLicence === undefined) {
                const err = new Error('Licences has been revoked.');
                err.status = 403;
                throw err;
            }

            res.redirect(`${process.env.BASE_PATH_URL}${process.env.BASE_PATH_ROUTE}${newLicence}`);
        });
}

function isActive(req, res, next) {
    const operation = 'isActive';
    logger.info({operation, licenceId: req.licenceId});

    accessLicenceClient.getLicenceInfo(req.licenceId)
        .then(currentLicence => {
            logger.info({operation, licenceId: req.licenceId, licenceStatus: currentLicence.status});

            if (currentLicence.status !== 'active') {
                return _goToNextLicence(req, res);
            }
            return currentLicence;
        })
        .then(() => {
            res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            next();
        })
        .catch(next);
}

function getLicenceDisplayInfo(req, res, next) {
    const operation = 'getLicenceDisplayInfo';
    logger.info({operation, licenceId: req.licenceId});

    acquisitionCtxClient.getContexts({'access-licence-id': req.licenceId})
        .then(licenceAcsDetails => {
            logger.info({operation, licenceId: req.licenceId, licenceName: JSON.stringify(licenceAcsDetails.AcquisitionContext.name)});
            next();
        })
        .catch(next);
}

module.exports = {
    isActive,
    getLicenceDisplayInfo
};
