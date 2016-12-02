const uriConstructor = require('../uriConstructor');
const logger = require('../logger');

module.exports = function (req, res, licenceList) {
    // if the licence is not valid but we have the KMT session => redirect to the first licence
    logger.info({
        operation: 'redirectToExistingSession',
        KATsessionExists: req.session.isPopulated,
        user: JSON.stringify(req.currentUser)
    });
    if (req.session && req.session.kmtLoggedIn && Array.isArray(licenceList) && licenceList[0] && licenceList[0].licenceId) {
        return res.redirect(`${process.env.BASE_PATH_URL}${process.env.BASE_PATH_ROUTE}${licenceList[0].licenceId}`);
    } else if (undefined === req.session.kmtLoggedIn) {
        logger.log('info', {
            operation: 'getUserId',
            redirect: 'to accounts.ft.com/login',
            reason: 'no FTSession found'
        });
        if (req.session) {
            req.session = null;
        }
        return res.redirect(uriConstructor.redirectUrl(req.originalUrl));
    } else {
        logger.info({
            operation: 'redirectToExistingSession',
            result: 'no valid licences available',
            licenceIdParam: req.params.licenceId
        });
        const err = new Error('redirectToExistingSession You need to have a valid license identifier to use this tool');
        err.status = 404;
        throw err;
    }
}
