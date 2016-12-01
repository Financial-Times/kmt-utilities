const logger = require('../logger');
const cookieHandler = require('../helpers/cookieHandler');

module.exports = function redirectDefaultLicence(req, res, next) {
	if (undefined === req.params.licenceId && req.currentUser && req.currentUser.uuid && req.listOfLicences) {
		const licenceId = req.listOfLicences[0].licenceId || cookieHandler.getLicenceListCookie(req, res);
		logger.log('info', {operation: 'redirectDefaultLicence', licenceId: licenceId});
		return res.redirect(`${process.env.BASE_PATH_URL}${process.env.BASE_PATH_ROUTE}${licenceId}`);
	}
	next();
}