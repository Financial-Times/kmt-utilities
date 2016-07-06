'use strict'
const fetch = require('isomorphic-fetch');
const config = require('../config');
const logger = require('../logger');
const json = require('../json');
const apiGatewayKey = config.get('API_GATEWAYKEY');

const headers = {
  'X-Api-Key': apiGatewayKey
};

module.exports = {

  getLicenceInfo: function* (accessLicenceId) {
    var response;

    response = yield fetch(config.get('ACC_LICENCE_SVC_HOST') +
        '/membership/licences/v1/' + accessLicenceId, { headers: headers });

    if (response.status >= 400) {
      logger.log('error', 'Failed to fetch licence info, ' +
        'accessLicenceId=%s, error=%s', accessLicenceId, response.statusText);
        var err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.log('info', 'Retrieved licence accessLicenceId=%s', accessLicenceId);
    return yield json.parse(response);
  },


  getSeats: function* (accessLicenceId, transactionId) {
    var response;

    response = yield fetch(config.get('ACC_LICENCE_SVC_HOST') + '/membership/licences/v1/' + accessLicenceId + '/seats', { headers: headers });

    logger.log('info', 'Retrieving seats for accessLicenceId=%s', accessLicenceId);

    if (response.status >= 400) {
      logger.log('error', 'Failed to fetch licence seats, ' +
        'accessLicenceId=%s, error=%s', accessLicenceId, response.statusText);
      var err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.log('info', 'Retrieved seats for accessLicenceId=%s', accessLicenceId);
    return yield json.parse(response);
  },

  getAdministrators: function* (accessLicenceId) {
    var response;

    logger.log('info', 'Retrieving administrators for accessLicenceId=%s', accessLicenceId);

    response = yield fetch(config.get('ACC_LICENCE_SVC_HOST') + '/membership/licences/v1/' + accessLicenceId + '/administrators', { headers: headers });

    if (response.status >= 400) {
      logger.log('error', 'Failed to retrieve licence administrators, accessLicenceId=%s, error=%s,', accessLicenceId, response.statusText);

      var err = Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.log('info', 'Retrieved administrators for accessLicenceId=%s', accessLicenceId);

    return yield json.parse(response);
  }
};
