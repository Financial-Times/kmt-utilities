const accessLicenceService = require('../services/accessLicenceService');
const logger = require('../logger');

module.exports = function* redirectDefaultLicence(req, res, next) {

	//should this be try catch and throw err if no licence is available
	if (undefined === req.params.licenceId && req.currentUser && req.currentUser.uuid) {
		if (!req.listOfLicences) {
			req.listOfLicences = yield accessLicenceService.getLicenceList({adminuserid:req.currentUser.uuid});
		}

		if (Array.isArray(req.listOfLicences) && req.listOfLicences[0] && req.listOfLicences[0].licenceId) {
			const licenceId = req.listOfLicences[0].licenceId;
			logger.log('info', {operation: 'redirectDefaultLicence', licenceId: licenceId});
			return res.redirect(`${process.env.BASE_PATH_URL}${process.env.BASE_PATH_ROUTE}${licenceId}`);
		}
	}
	next();
}
