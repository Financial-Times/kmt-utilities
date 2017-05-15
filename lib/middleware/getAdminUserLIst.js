const logger = require('./../logger');
const licenceDataClient = require('kat-client-proxies').licenceDataClient;


module.exports = (req, res, next) => {
  const operation = 'getAdminUserList';
  logger.info({operation, licenceId: req.licenceId});

  licenceDataClient.getAdminUserList(req.licenceId)
      .then(result => {
        req.adminUserList = result;
        next();
      })
      .catch(next);
};
