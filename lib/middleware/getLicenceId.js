const logger = require('../logger');
const redirectToExistingSession = require('./redirectToExistingSession');
const getListOfLicences = require('./getListOfLicences');

module.exports = (req, res, next) => {
	const operation = 'getLicenceId';
	logger.info({operation, licenceId: req.params.licenceId});

	// check licence signature
	if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(req.params.licenceId)) {
		req.licenceId = req.params.licenceId;
		return Promise.resolve(next());
	}

	const userErr = new Error('You need to have a valid license identifier to use this tool');
	userErr.status = 404;

	// if the session is populated
	if (req.session && req.session.isPopulated && req.currentUser) {
		logger.info({operation, msg: 'attempt to redirect to default licence'});

		return getListOfLicences(req)
			.then(() => redirectToExistingSession(req, res, next))
			.catch(err => {
				logger.info({operation, licenceId: req.params.licenceId, err});
				next(userErr);
			});
	}

	logger.error({operation, result: 'invalid licenceId', licenceIdParam: req.params.licenceId});
	next(userErr);
	return Promise.reject(userErr);
};
