const logger = require('../logger');

module.exports = (req, res, next) => {
    logger.info({operation: 'checkMaintenanceStatus'});

    if (res.locals.flags.katMaintenance) {
      res.send(503); //503 status is the one we set Maintenance Page for in Fastly
    } else {
      next();
    }
};
