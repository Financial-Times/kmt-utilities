const fetch = require('isomorphic-fetch');
const logger = require('../logger')
const config = require('../config');
const uriFragSplitter = require('../helpers/uriFragSplitter');
const serviceUri = config.get('API_GATEWAY_HOST');
const clientId = config.get('API_AUTH_CLIENT_ID');
const redirectUrl = 'https://www.ft.com';

module.exports = {
  getAuthToken: function* (FTSessionSecure, scope) {

    const options = {
      method: 'GET',
      headers: {
        Cookie: `FTSession_s=${FTSessionSecure}`
      }
    };

    scope = scope ||'licence_data' ;

    logger.info({operation:'apiAuthService.getAuthToken', requestUri:serviceUri + `/authorize?response_type=token&client_id=${clientId}&scope=${scope}`});

    try {

      //TODO include scope in request once Memb confirm it can handle it
      const response = yield fetch(serviceUri + `/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUrl}&scope=${scope}`, options);

      logger.info({operation:'apiAuthService.getAuthToken', responseStatus:response.status});

        if (response.status > 400) {
          logger.info({operation:'apiAuthService.getAuthToken', responseText:response.statusText, responseStatus:response.status});

          return null;
          //throw new Error(response.message !== undefined ? response.message : response.statusText);
        }

      const authObj = uriFragSplitter(response.url);

       //Happy path
         if ('access_token' in authObj) {
           logger.info({operation:'apiAuthService.getAuthToken', result:'success'});
           return authObj.access_token;

         } else if ('error' in authObj && (authObj.error === 'invalid_grant' || authObj.error === 'invalid_request')) {

            logger.info({operation:'apiAuthService.getAuthToken', error:authObj.error, errorDescription:authObj.error_description});

            let err = new Error('Unauthorized');
            err.status = 401;
            throw err;
          } else {
            // how do we wanna handle this indeed if there is a this
            throw new Error('Unexpected response from auth service');
          }
      } catch (err) {
      throw err;
    }
  }
};
