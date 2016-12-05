'use strict';

const fetch = require('isomorphic-fetch');
const config = require('../config');
const logger = require('../logger');
const json = require('../json');
const accessLicenceServiceUrl = config.get('ACC_LICENCE_SVC_HOST') + '/membership/licences/v1/';
const toQueryString = require('../toQueryString');
const headers = {
  'X-Api-Key': config.get('MEMCOM_APIKEY')
};

module.exports = {

  getLicenceList: function* (options = null) {
    let endpoint = accessLicenceServiceUrl;

    if (options) {
      logger.info({operation:'getFilteredUserList',
      Options:'true'});
      endpoint += toQueryString(options);
    }

    logger.log('info', {operation:'getLicenceList', request:endpoint.split('?')[0]});

    let response = yield fetch(endpoint, { headers: headers });

    if (response.status >= 400) {
      logger.log('info', {operation:'getLicenceList', filteredBy:Object.keys(options), result:'failed', error:response.statusText});

      let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getLicenceInfo', filteredBy:Object.keys(options), result:'success'});
    return yield json.parse(response);
  },

  getLicenceInfo: function* (accessLicenceId) {

    let response = yield fetch(accessLicenceServiceUrl + accessLicenceId, { headers: headers });

    if (response.status >= 400) {
      logger.info({operation:'getLicenceInfo', licenceId:accessLicenceId, result:'failed', error:response.statusText});

      let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getLicenceInfo', licenceId:accessLicenceId, result:'success'});
    return yield json.parse(response);
  },


  getSeats: function* (accessLicenceId) {

    let response = yield fetch(accessLicenceServiceUrl + accessLicenceId + '/seats', { headers: headers });

    logger.info({operation:'getSeats', licenceId:accessLicenceId});

    if (response.status >= 400) {
      logger.info({operation:'getSeats', licenceId:accessLicenceId, result:'failed', error:response.statusText});

      let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getSeats', licenceId:accessLicenceId, result:'success'});
    return yield json.parse(response);
  },

  getAdministrators: function* (accessLicenceId) {

    logger.info({operation:'getAdministrators', licenceId:accessLicenceId, requestUrl:accessLicenceServiceUrl + accessLicenceId + '/administrators'});

    let response = yield fetch(accessLicenceServiceUrl + accessLicenceId + '/administrators', { headers: headers });

    if (response.status >= 400) {
      logger.info({operation:'getAdministrators', licenceId:accessLicenceId, result:'failed', error:response.statusText});

      let err = Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getAdministrators', licenceId:accessLicenceId, result:'success'});

    return yield json.parse(response);
  }
};
