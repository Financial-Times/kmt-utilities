const fetch = require('isomorphic-fetch');
const logger = require('@financial-times/n-logger').default;
const config = require('../config');
const uriFragSplitter = require('../uriFragSplitter');
const querySting = require('../toQueryString');
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

        logger.info({operation:'readyAuthResponse', responseUrl:response.url});

      const authObj = uriFragSplitter(response.url);

       //Happy path
         if ('access_token' in authObj) {
            //return auth.access_token;
            logger.info({operation:'getAuthToken', result:'success', tokenValue:authObj.access_token});
          } else if ('error' in authObj) {
            //return auth.error;
              logger.info({operation:'getAuthToken', result:'fail', errorMessage:authObj.error_description});
            //logger.info({operation:'getAuthToken', error:getURIFragment(response.url)});
            throw new Error('Invalid authToken');
          } else {
            // how do we wanna handle this indeed if there is a this
            //throw new Error('oh no something has gon wrong');
          }
      }
    catch (err) {
      throw err;
    }
  }
};
