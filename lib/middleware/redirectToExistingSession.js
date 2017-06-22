const uriConstructor = require('../uriConstructor');
const logger = require('../logger');
const config = require('../config');

module.exports = (req, res, next) => {
    const operation = 'redirectToExistingSession';
    logger.info({
        operation,
        KATsessionExists: req.session ? req.session.isPopulated : undefined,
        user: JSON.stringify(req.currentUser)
    });

    return new Promise((resolve, reject) => {
        if (req.session) {
            // if the licence is not valid but we have the KMT session => redirect to the first licence
            if (req.session.kmtLoggedIn && Array.isArray(req.listOfLicences) && req.listOfLicences[0] && req.listOfLicences[0].licenceId) {
                logger.info({operation, licenceToRedirectTo: req.listOfLicences[0].licenceId});

                res.redirect(`${process.env.BASE_PATH_URL}${process.env.BASE_PATH_ROUTE}${req.listOfLicences[0].licenceId}`);
                return resolve();
            }

            if (undefined === req.session.kmtLoggedIn) {
                logger.info({operation, redirect: 'to accounts.ft.com/login', reason: 'no FTSession found'});

                req.session = null;

                return fetch(config.LOGOUT_URL, {headers: req.headers})
                    .catch(err => err)
                    .then(() => {
                        res.redirect(uriConstructor.redirectUrl(req));

                        resolve();
                    });

            }
        }

        logger.info({operation, redirect: 'no valid licences available', licenceIdParam: req.params.licenceId});
        const err = new Error('You need to have a valid license identifier to use this tool.');
        err.status = 404;
        next(err);
        return reject(err);
    });
};
