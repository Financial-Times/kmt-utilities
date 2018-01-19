const logger = require('./../logger');
const accessLicenceClient = require('@financial-times/kat-client-proxies').accessLicenceClient;
const licenceDataClient = require('@financial-times/kat-client-proxies').licenceDataClient;

module.exports = (req, res, next) => {
	const operation = 'getLicenceSeatsInfo';
	logger.info({operation, licenceId: req.licenceId});

	req.licenceSeatsInfo = {
		seatLimit: -1,
		seatsAllocated: -1
	};

	//This is the max number of results LDS will return per request and cannot be certain of a
	//seatLimit value being returned from ALS to calculate how many request are needed
	//Set here as our largest licence is circa 13,000 so unlikely to be an issue.
	//Needs reviewing
	const userListOptions = {
		limit: 50000
	};

	return Promise.all([
		accessLicenceClient.getLicenceInfo(req.licenceId)
			.then(currentLicence => {
				logger.info({operation, subOp: 'getLicenceInfo', licenceId: req.licenceId, seatLimit: currentLicence.seatLimit});
				req.licenceSeatsInfo.seatLimit = (currentLicence.seatLimit) ? currentLicence.seatLimit : -1;
			})
			.catch(err => {
				logger.error({operation, subOp: 'getLicenceInfo', licenceId: req.licenceId, err});
				return err;
			}),

			licenceDataClient.getFilteredUserList(req.licenceId, req.apiAuthToken, userListOptions)
			.then(licenceSeats => {
				logger.info({operation, subOp: 'getSeats', licenceId: req.licenceId});
				req.licenceSeatsInfo.seatsAllocated = Array.isArray(licenceSeats.seatHolders) ? licenceSeats.seatHolders.length : 0;

				logger.info({operation, subOp: 'getSeats', licenceId: req.licenceId, seatLimit: req.licenceSeatsInfo.seatLimit, allocatedSeats: req.licenceSeatsInfo.seatsAllocated});

			})
			.catch(err => {
					logger.error({operation, subOp: 'getSeats', licenceId: req.licenceId, err});
					return err;
				})
	]).then(() => next());
};
