'use strict';

const fetch = require('isomorphic-fetch');
const config = require('../config');
const logger = require('../logger');
const json = require('../json');
const toQueryString = require('../toQueryString');
const apiGatewayKey = config.get('API_GATEWAYKEY');
const headers = {
  'X-Api-Key': apiGatewayKey
};

let accessLicenceServiceUrl = config.get('ACC_LICENCE_SVC_HOST') + '/membership/licences/v1/';

module.exports = {

  getLicenceList: function* (options = null) {

    if (options) {
      logger.info({operation:'getFilteredUserList',
      Options:'true'});
      accessLicenceServiceUrl += toQueryString(options);
    }

    let response = yield fetch(accessLicenceServiceUrl, { headers: headers });

    if (response.status >= 400) {
      logger.info({operation:'getLicenceList', filteredBy:JSON.stringify(options), result:'failed', error:response.statusText});
        var err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getLicenceInfo', filteredBy:JSON.stringify(options), result:'success'});
    return yield json.parse(response);
  },

  getLicenceInfo: function* (accessLicenceId) {
    var response;

    response = yield fetch(accessLicenceServiceUrl + accessLicenceId, { headers: headers });

    if (response.status >= 400) {
      logger.info({operation:'getLicenceInfo', licenceId:accessLicenceId, result:'failed', error:response.statusText});
        var err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getLicenceInfo', licenceId:accessLicenceId, result:'success'});
    return yield json.parse(response);
  },


  getSeats: function* (accessLicenceId) {
    var response;

    response = yield fetch(accessLicenceServiceUrl + accessLicenceId + '/seats', { headers: headers });

    logger.info({operation:'getSeats', licenceId:accessLicenceId});

    if (response.status >= 400) {
      logger.info({operation:'getSeats', licenceId:accessLicenceId, result:'failed', error:response.statusText});
      var err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getSeats', licenceId:accessLicenceId, result:'success'});
    return yield json.parse(response);
  },

  getAdministrators: function* (accessLicenceId) {
    var response;

    logger.info({operation:'getAdministrators', licenceId:accessLicenceId});

    response = yield fetch(accessLicenceServiceUrl + accessLicenceId + '/administrators', { headers: headers });

    if (response.status >= 400) {
      logger.info({operation:'getAdministrators', licenceId:accessLicenceId, result:'failed', error:response.statusText});

      var err = Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getAdministrators', licenceId:accessLicenceId, result:'success'});

    return yield json.parse(response);
  }
};
