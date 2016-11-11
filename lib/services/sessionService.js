'use strict';

const fetch = require('isomorphic-fetch');
const config = require('../config');
const logger = require('../logger');
const json = require('../json');
const serviceUri = config.get('API_GATEWAY_HOST');
const apiGatewayKey = config.get('API_GATEWAYKEY');


const headers = {
  'X-Api-Key': apiGatewayKey
};

module.exports = {
  verify: function* (sessionKey) {
    const params = {
      method: 'GET',
      headers: headers
    };

    logger.info({operation:'verifyingSession', requestUri:serviceUri + '/sessions/[sessionID]'});

    try {
      const response = yield fetch(serviceUri + '/sessions/' + sessionKey, params);

      if (response.status !== 200) {

        if (response.status === 404) {
          logger.info({operation:'verifyingSession', response: 'Invalid or revoked session'});
          let err = new Error('invalid session');
          err.status = 403;
          throw err;
        }
        logger.info({operation:'verifyingSession', responseText:response.statusText, responseStatus:response.status});
        throw new Error(response.message !== undefined ? response.message : response.statusText);
      }

      //Happy path
      logger.info({operation:'verifyingSession', result:'success'});
      return yield json.parse(response);
    }
    catch (err) {
      throw err;
    }
  }
};
