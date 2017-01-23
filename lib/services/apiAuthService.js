const fetch = require('isomorphic-fetch');
const logger = require('../logger')
const config = require('../config');
const uriFragSplitter = require('../helpers/uriFragSplitter');
const serviceUri = config.get('API_GATEWAY_HOST');
const clientId = config.get('API_AUTH_CLIENT_ID');
const redirectUrl = 'https://www.ft.com';

module.exports = {
  getAuthToken: function* (FTSessionSecure, scope = 'licence_data') {

    const options = {
      method: 'GET',
      headers: {
        Cookie: `FTSession_s=${FTSessionSecure}`
      }
    };

    logger.info({operation:'apiAuthService.getAuthToken', requestUri:serviceUri + `/authorize?response_type=token&client_id=${clientId}&scope=${scope}`});

    try {
      const response = yield fetch(serviceUri + `/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUrl}&scope=${scope}`, options);

      logger.info({operation:'apiAuthService.getAuthToken', responseStatus:response.status});

        if (response.status > 400) {
          logger.info({operation:'apiAuthService.getAuthToken', responseText:response.statusText, responseStatus:response.status});

          let err = new Error(response.statusText);
          err.status = response.status;
          throw err;
        }

      const authObj = uriFragSplitter(response.url);

       //Happy path
         if ('access_token' in authObj) {
           logger.info({operation:'apiAuthService.getAuthToken', result:'success'});
           return authObj.access_token;

           //Setting unauthoized on the presens of error
           //The value can be any of the following for an invalid session invalid_grant invalid_request invalid_scope right now
         } else if ('error' in authObj) {
            logger.info({operation:'apiAuthService.getAuthToken', error:authObj.error, errorDescription:authObj.error_description});

            let err = new Error('Unauthorized');
            err.status = 401;
            throw err;
          } else {
            // how do we wanna handle this indeed if there is a this
            let err = new Error(`whaaaat ${JSON.stringify(authObj)}`);
            err.status = response.status;
            throw err;
          }
      } catch (err) {
      throw err;
    }
  }
};
