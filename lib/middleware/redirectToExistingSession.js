const uriConstructor = require('../uriConstructor');
const logger = require('../logger');

module.exports = (req, res, next) => {
    const operation = 'redirectToExistingSession';
    logger.info({operation, KATsessionExists: req.session.isPopulated, user: JSON.stringify(req.currentUser)});

    // if the licence is not valid but we have the KMT session => redirect to the first licence
    if (req.session && req.session.kmtLoggedIn && Array.isArray(req.listOfLicences) && req.listOfLicences[0] && req.listOfLicences[0].licenceId) {
        logger.info({operation, licenceToRedirectTo: req.listOfLicences[0].licenceId});

        return res.redirect(`${process.env.BASE_PATH_URL}${process.env.BASE_PATH_ROUTE}${req.listOfLicences[0].licenceId}`);
    }

    if (undefined === req.session.kmtLoggedIn) {
        logger.info({operation, redirect: 'to accounts.ft.com/login', reason: 'no FTSession found'});

        req.session = null;
        return res.redirect(uriConstructor.redirectUrl(req.originalUrl));
    }

    logger.info({operation, redirect: 'no valid licences available', licenceIdParam: req.params.licenceId});
    const err = new Error('You need to have a valid license identifier to use this tool.');
    err.status = 404;
    next(err);
};
