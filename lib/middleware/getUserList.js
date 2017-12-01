const logger = require('./../logger');
const licenceDataClient = require('@financial-times/kat-client-proxies').licenceDataClient;

module.exports = (req, res, next) => {
	logger.info({operation: 'getUserList'});

	return licenceDataClient.getFilteredUserList(req.licenceId, req.apiAuthToken)
		.then(result => {
			req.userList = result;
			if (result.seatHolders) {
				req.userList = result.seatHolders;
			}
			next();
		})
		.catch(next);
};
