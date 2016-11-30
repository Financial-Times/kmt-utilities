const logger = require('../logger');

module.exports = function redirectDefaultLicense(req, res, next) {
	if (undefined === req.params.licenceId && req.currentUser && req.currentUser.uuid && req.listOfLicences) {
		const licenceId = req.listOfLicences[0].licenceId;
		logger.log('info', {operation: 'redirectDefaultLicense', licenceId: licenceId});
		res.redirect(301, licenceId);
		res.end();
		return;
	}
	next();
}