'use strict';

const fetch = require('isomorphic-fetch');
const config = require('../config');
const logger = require('../logger');
const json = require('../json');
const toQueryString = require('../toQueryString');
const licenceDataService = config.get('LICENCE_DATA_SVC_HOST') +'/membership/licence-seat-holders/';

const headers = {
  'X-Api-Key': config.get('MEMCOM_APIKEY')
};

function* getUserList(accessLicenceId) {
    logger.info({operation:'getUserList', requestUrl:licenceDataService +accessLicenceId});
    let response = yield fetch(licenceDataService +accessLicenceId, {headers:headers});

    if (response.status >= 400) {
      logger.info({operation:'getUserList', requestUrl:licenceDataService + accessLicenceId, result:'failed', error:response.statusText});
        let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getUserList', licenceId:accessLicenceId, result:'success'});
    return yield json.parse(response);
}

function* getFilteredUserList(accessLicenceId, options = {}) {
    logger.info({operation:'getFilteredUserList', requestUrl:licenceDataService +accessLicenceId});
    let endpoint = licenceDataService +accessLicenceId;

    if (Object.keys(options).length > 0) {
      logger.info({operation:'getFilteredUserList', licenceId:accessLicenceId, Options:'no options passed'});
      let queryString = toQueryString(options);
      endpoint = endpoint + queryString;
    }
    logger.info({operation:'getFilteredUserList', requestUrl:endpoint});
    let response = yield fetch(endpoint, {headers:headers});

    if (response.status >= 400) {
      logger.info({operation:'getFilteredUserList', licenceId:accessLicenceId, result:'failed', error:response.statusText});
        let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getFilteredUserList', licenceId:accessLicenceId, result:'success'});
    return yield json.parse(response);
}

function* getAdminUserList(accessLicenceId) {

    let response = yield fetch(licenceDataService +accessLicenceId+'/admins', {headers:headers});

    if (response.status >= 400) {
      logger.info({operation:'getAdminUserList', licenceId:accessLicenceId, result:'failed', error:response.statusText});
        let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.info({operation:'getAdminUserList', licenceId:accessLicenceId, result:'success'});
    return yield json.parse(response);
}

module.exports = {
    getUserList : getUserList,
    getFilteredUserList: getFilteredUserList,
    getAdminUserList: getAdminUserList
}
