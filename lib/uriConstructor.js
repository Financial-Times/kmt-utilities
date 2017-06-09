const logger = require('./logger');
const config = require('./config');
const loginUrl = config.LOGIN_URL;

module.exports = {
  redirectUrl: (req) => {
    logger.info({operation:`redirect to ${loginUrl}`});
    const loginReferrerUrl = encodeURI(`${req.protocol}://${req.hostname}${req.originalUrl}`);
    return loginUrl + loginReferrerUrl;
  }
};
