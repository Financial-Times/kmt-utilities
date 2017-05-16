const logger = require('./../logger');
const accessLicenceClient = require('kat-client-proxies').accessLicenceClient;

module.exports = (req, res, next) => {
    const operation = 'getLicenceSeatsInfo';
    logger.info({operation, licenceId: req.licenceId});

    req.licenceSeatsInfo = {
        seatLimit: -1,
        seatsAllocated: -1
    };

    Promise.all([
        accessLicenceClient.getLicenceInfo(req.licenceId)
            .then(currentLicence => {
                logger.info({operation, subOp: 'getLicenceInfo', licenceId: req.licenceId, seatLimit: currentLicence.seatLimit});
                req.licenceSeatsInfo.seatLimit = currentLicence.seatLimit || -1;
            })
            .catch(err => {
                logger.error({operation, subOp: 'getLicenceInfo', licenceId: req.licenceId, err});
                return err;
            }),

        accessLicenceClient.getSeats(req.licenceId)
            .then(currentSeats => {
                const seatCount = Array.isArray(currentSeats) ? currentSeats.length : 0;
                logger.info({operation, subOp: 'getSeats', licenceId: req.licenceId, allocatedSeatCount: seatCount});
                req.licenceSeatsInfo.seatsAllocated = seatCount || 0;
            })
            .catch(err => {
                logger.error({operation, subOp: 'getSeats', licenceId: req.licenceId, err});
                return err;
            })
    ]).then(() => next());
};
