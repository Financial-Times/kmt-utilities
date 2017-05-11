const logger = require('./../logger');
const licenceDataClient = require('kat-client-proxies').licenceDataClient;

module.exports = (req, res, next) => {
    logger.info({operation: 'getUserList'});

    licenceDataClient.getFilteredUserList(req.licenceId)
        .then(result => {
            req.userList = result;
            next();
        })
        .catch(next);
};
