const logger = require('./../logger');
const getListOfLicences = require('./getListOfLicences');

module.exports = (req, res, next) => {
    const operation = 'getLicenceList';
    logger.info({operation, adminUserId: req.currentUser.uuid});

    return getListOfLicences(req)
        .then(() => next())
        .catch(err => {
            logger.error({operation, err});

            const userErr = new Error('Unauthorized');
            userErr.status = 403;
            next(userErr);
        });
};


