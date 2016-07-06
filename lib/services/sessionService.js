'use strict';

const fetch = require('isomorphic-fetch');
const config = require('../config');
const logger = require('../logger');
const json = require('../json');
const serviceUri = config.get('SESSION_API_HOST');
const apiGatewayKey = config.get('API_GATEWAYKEY');

const headers = {
  'X-Api-Key': apiGatewayKey
};

module.exports = {
  verify: function* (sessionKey, transactionId) {
    const params = {
      method: 'GET',
      headers: headers;
    };

    logger.log('info', 'Verifying session for sessionKey=%s', sessionKey);

    try {
      var response = yield fetch(serviceUri + '/membership/sessions/' + sessionKey, params);

      if (response.status !== 200) {
        logger.log('error', 'Unable to verify session for sessionKey=%s', sessionKey);
        logger.log('error', 'Response: ', response.statusText);

        throw new Error(response.message !== undefined ? response.message : response.statusText);
      }

      logger.log('info', 'Session verified for sessionKey=%s', sessionKey);
      return yield json.parse(response);
    }
    catch (e) {
      throw e;
    }
  }
};
