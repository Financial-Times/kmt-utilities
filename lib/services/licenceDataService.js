'use strict';

const fetch = require('isomorphic-fetch');
const config = require('../config');
const logger = require('../logger');
const json = require('../json');
const toQueryString = require('../helpers/toQueryString');
const licenceDataService = config.get('API_GATEWAY_HOST') +'/licence-seat-holders/';

function setHeaders(apiAuthToken) {
  let headers = {
    'X-Api-Key': config.get('MEMCOM_APIKEY'),
  };

  if (apiAuthToken) {
    headers.authorization = `Bearer ${apiAuthToken}`;
  }
  return headers;
}

function* getUserList(accessLicenceId, apiAuthToken) {

    logger.info({operation:'getUserList', requestUrl:licenceDataService +accessLicenceId, autToken:apiAuthToken});
    let response = yield fetch(licenceDataService +accessLicenceId, {headers:setHeaders(apiAuthToken)});

    if (response.status >= 400) {
      logger.info({operation:'getUserList', requestUrl:licenceDataService + accessLicenceId, result:'failed', error:response.statusText});
        let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getUserList', licenceId:accessLicenceId, result:'success'});
    return yield json.parse(response);
}


function* getAdminUserList(accessLicenceId, adminUserId, apiAuthToken) {

  logger.info({operation:'getAdminUserList', requestUrl:licenceDataService + accessLicenceId + '/admins'});
    let response = yield fetch(licenceDataService +accessLicenceId+'/admins', {headers:setHeaders(apiAuthToken)});

    if (response.status >= 400) {
      logger.info({operation:'getAdminUserList', licenceId:accessLicenceId, result:'failed', error:response.statusText});
        let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getAdminUserList', licenceId:accessLicenceId, result:'success'});
    return yield json.parse(response);
}

function* getAdminList(accessLicenceId, apiAuthToken) {

  logger.info({operation:'getAdminUserList', requestUrl:licenceDataService + accessLicenceId + '/admins'});
    let response = yield fetch(licenceDataService +accessLicenceId+'/admins', {headers:setHeaders(apiAuthToken)});

    if (response.status >= 400) {
      logger.info({operation:'getAdminUserList', licenceId:accessLicenceId, result:'failed', error:response.statusText});
        let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getAdminUserList', licenceId:accessLicenceId, result:'success'});
    return yield json.parse(response);
}

function* getFilteredUserList(accessLicenceId, options = {}, apiAuthToken) {

  logger.info({operation:'getFilteredUserList', apiAuthToken:apiAuthToken});

    logger.info({operation:'getFilteredUserList', requestUrl:licenceDataService + accessLicenceId, apiAuthToken:apiAuthToken});
    let endpoint = licenceDataService + accessLicenceId;

    if (Object.keys(options).length > 0) {
      logger.info({operation:'getFilteredUserList', licenceId:accessLicenceId, Options:'no options passed'});
      let queryString = toQueryString(options);
      endpoint = endpoint + queryString;
    }
    logger.info({operation:'getFilteredUserList', requestUrl:endpoint});
    let response = yield fetch(endpoint, {headers:setHeaders(apiAuthToken)});

    if (response.status >= 400) {
      logger.info({operation:'getFilteredUserList', licenceId:accessLicenceId, result:'failed', error:response.statusText});
        let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getFilteredUserList', licenceId:accessLicenceId, result:'success'});
    return yield json.parse(response);
}

module.exports = {
    getUserList : getUserList,
    getFilteredUserList: getFilteredUserList,
    getAdminUserList: getAdminUserList,
    getAdminList: getAdminList
}
