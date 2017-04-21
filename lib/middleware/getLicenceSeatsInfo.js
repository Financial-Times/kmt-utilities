  const accessLicenceService = require('../services/accessLicenceService');
  const logger = require('../logger');

module.exports = function* (req, res, next) {

  req.licenceSeatsInfo = {
    seatLimit: -1,
    seatsAllocated: -1
  };

  try {
    const currentLicence = yield accessLicenceService.getLicenceInfo(req.licenceId);
    const currentSeats = yield accessLicenceService.getSeats(req.licenceId);
    req.licenceSeatsInfo.seatLimit = currentLicence.seatLimit || -1;
    req.licenceSeatsInfo.seatsAllocated = currentSeats.allocatedSeatCount || 0;
  } catch (err) {
    logger.error({operation: 'getLicenceSeatsInfo', err});
  }

  next();
}
