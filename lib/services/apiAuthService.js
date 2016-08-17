const fetch = require('isomorphic-fetch');
const config = require('../config');
const logger = require('@financial-times/n-logger').default;
const serviceUri = config.get('API_GATEWAY_HOST');
const clientId = config.get('API_AUTH_CLIENT_ID');

function getURIFragment(responseUrI) {
  let fragment = decodeURIComponent(responseUrI.split('#')[1]);
  let message = fragment.split('&');
  logger.info({uriFragments:message});

  if (message[0].indexOf('error') !== -1) {
    //TODO extract error message
      let errorMessage = 'invalidToken';
      logger.info({error:errorMessage});
    return false;
  }

  let accessToken = message[1].split('=')[1];
  logger.info({accessToken:accessToken});
  return accessToken;
}

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
       //Happy path
       //Extract he access_token value
        if (!getURIFragment(response.url)) {
          logger.info({operation:'getAuthToken', result:'fail'});
          //logger.info({operation:'getAuthToken', error:getURIFragment(response.url)});
          throw new Error('Invalid authToken');
        }

        logger.info({operation:'getAuthToken', result:'success'});
        logger.info({operation:'getAuthToken', accessToken:getURIFragment(response.url)});
        //Not so happy path

        //Check if it contains error param return error_description
        //logger.info({operation:'getAuthToken', result:'bad response'});
        //return yield response;


      }
    catch (err) {
      throw err;
    }
  }
};
