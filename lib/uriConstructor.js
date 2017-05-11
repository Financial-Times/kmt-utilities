const logger = require('./logger');
const config = require('./config');
const loginUrl = config.LOGIN_URL;

module.exports = {
  redirectUrl: (path) => {
    logger.info({operation:`redirect to ${loginUrl}`});
    const loginReferrerUrl = encodeURI(config.BASE_PATH_URL + path);
    return loginUrl + loginReferrerUrl.replace(/([^:]\/)\/+/g, '$1');
  }
};
