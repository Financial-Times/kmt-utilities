const fetch = require('isomorphic-fetch');
const config = require('../config');
const logger = require('@financial-times/n-logger').default;
const serviceUri = config.get('API_GATEWAY_HOST');
const clientId = config.get('API_AUTH_CLIENT_ID');

module.exports = {
  getAuthToken: function* (ftSession) {
    const options = {
      method: 'GET',
      headers: {
        Cookie: `FTSession_s=${ftSession}`
      }
    };

    logger.info({operation:'getAuthToken', requestUri:serviceUri + '/authorize'});

    try {
      const response = yield fetch(serviceUri + `/authorize?response_type=token&client_id=${clientId}`, options);

      if (response.status !== 302) {
        logger.info({operation:'getAuthToken', responseText:response.statusText, responseStatus:response.status});

        throw new Error(response.message !== undefined ? response.message : response.statusText);
      }

      //TODO access the Location response header
      //const locationHeader = response.header.location

      //Happy path
      //Extract he access_token value

      //let accessToken =
      //return yield accessToken;
      logger.info({operation:'getAuthToken', result:'success'});

      //Not so happy path

      //Check if it contains error param return error_description
      logger.info({operation:'getAuthToken', result:'bad response'});
    }
    catch (e) {
      throw e;
    }
  }
};
