const logger = require('./../logger');
const getListOfLicences = require('./getListOfLicences');

module.exports = (req, res, next) => {
	const operation = 'redirectDefaultLicence';
	logger.info({operation, currentUser: JSON.stringify(req.currentUser)});

	return getListOfLicences(req)
		.then(() => {
			// if we have the list of licences => redirect to the fist one in the list
			if (Array.isArray(req.listOfLicences) && req.listOfLicences[0] && req.listOfLicences[0].licenceId) {
				const licenceId = req.listOfLicences[0].licenceId;
				logger.info({operation, licenceId: licenceId, msg: `redirecting to ${licenceId}`});

				return res.redirect(`${process.env.KAT_BASE_PATH_URL || process.env.BASE_PATH_URL}${process.env.BASE_PATH_ROUTE}${licenceId}`);
			}

			throw new Error('No list of licences found');
		})
		.catch(err => {
			logger.info({operation, err});

			const userErr = new Error('You need to have a valid license identifier to use this tool.');
			userErr.status = 404;
			next(userErr);
		});
};
