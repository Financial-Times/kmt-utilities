const fetch = require('isomorphic-fetch');
const logger = require('../logger')
const config = require('../config');
const uriFragSplitter = require('../uriFragSplitter');
const serviceUri = config.get('API_GATEWAY_HOST');
const clientId = config.get('API_AUTH_CLIENT_ID');

module.exports = {
  getAuthToken: function* (req, res, next) {

    const options = {
      method: 'GET',
      headers: {
        Cookie: `FTSession_s=${req.FTSession}`
      }
    };

    logger.info({operation:'getAuthToken', requestUri:serviceUri + `/authorize?response_type=token&client_id=${clientId}`});

    try {

      //TODO maybe use something other than fetch so we don't have to follow the redirect.
      const response = yield fetch(serviceUri + `/authorize?response_type=token&client_id=${clientId}`, options);
        if (response.status !== 200) {
          logger.info({operation:'getAuthToken', responseText:response.statusText, responseStatus:response.status});

          throw new Error(response.message !== undefined ? response.message : response.statusText);
        }

      logger.info({operation:'readyAuthResponse', responseStatus:response.status});

      const authObj = uriFragSplitter(response.url);

       //Happy path
         if ('access_token' in authObj) {
            return authObj.access_token;

            logger.info({operation:'getAuthToken', result:'success', tokenValue:authObj.access_token});

          } else if ('error' in authObj) {

            logger.info({operation:'getAuthToken', error:authObj.error, errorDescription:authObj.error_description});

            throw new Error(authObj.error_description);
          } else {
            // how do we wanna handle this indeed if there is a this
            throw new Error('Unexpected response from auth service');
          }
      } catch (err) {
      throw err;
    }
  }
};
