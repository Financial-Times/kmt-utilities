const logger = require('../logger');
const cookieHandler = require('../helpers/cookieHandler');

module.exports = function redirectDefaultLicence(req, res, next) {
	if (undefined === req.params.licenceId && req.currentUser && req.currentUser.uuid) {
		const licenceList = req.listOfLicences || cookieHandler.getLicenceListCookie(req, res);

		if (Array.isArray(licenceList) && licenceList[0] && licenceList[0].licenceId) {
			const licenceId = licenceList[0].licenceId;
			logger.log('info', {operation: 'redirectDefaultLicence', licenceId: licenceId});
			return res.redirect(`${process.env.BASE_PATH_URL}${process.env.BASE_PATH_ROUTE}${licenceId}`);
		}
	}
	next();
}
