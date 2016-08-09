'use strict';

const fetch = require('isomorphic-fetch');
const config = require('../config');
//const logger = require('..///logger');
const json = require('../json');
const toQueryString = require('../toQueryString');
const licenceDataService = config.get('LICENCE_DATA_SVC_HOST') +'/membership/licence-seat-holders/';

const headers = {
  'X-Api-Key': config.get('MEMCOM_APIKEY')
};

function* getUserList(accessLicenceId) {
    //logger.log('info','url=%',licenceDataService +accessLicenceId);
    let response = yield fetch(licenceDataService +accessLicenceId, {headers:headers});

    if (response.status >= 400) {
      //logger.log('error', 'Failed to fetch licence data for accessLicenceId=%s, error=%s', accessLicenceId, response.statusText);
        let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    //logger.log('info', 'Retrieved userList for accessLicenceId=%s', accessLicenceId);
    return yield json.parse(response);
}

function* getFilteredUserList(accessLicenceId, options = {}) {
    //logger.log('info', 'lds host',config.get('LICENCE_DATA_SVC_HOST'));
    //logger.log('info','url=%',licenceDataService +accessLicenceId);
    let endpoint = licenceDataService +accessLicenceId;

    if (Object.keys(options).length > 0) {
      //logger.log('info','no options passed',Object.keys(options).length);
      let queryString = toQueryString(options);
      endpoint = endpoint + queryString;
    }
    //logger.log('warn','request url=%',endpoint);
    let response = yield fetch(endpoint, {headers:headers});

    if (response.status >= 400) {
      //logger.log('error', 'Failed to fetch licence data for accessLicenceId=%s, error=%s', accessLicenceId, response.statusText);
        let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    //logger.log('info', 'Retrieved userList for accessLicenceId=%s', accessLicenceId);
    return yield json.parse(response);
}

function* getAdminUserList(accessLicenceId) {

    let response = yield fetch(licenceDataService +accessLicenceId+'/admins', {headers:headers});

    if (response.status >= 400) {
      //logger.log('error', 'Failed to fetch licence admins users for accessLicenceId=%s, error=%s', accessLicenceId, response.statusText);
        let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    //logger.log('info', 'Retrieved admin users for accessLicenceId=%s', accessLicenceId);
    return yield json.parse(response);
}

module.exports = {
    getUserList : getUserList,
    getFilteredUserList: getFilteredUserList,
    getAdminUserList: getAdminUserList
}
