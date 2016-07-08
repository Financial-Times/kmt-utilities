'use strict';

const fetch = require('isomorphic-fetch');
const config = require('../config');
const logger = require('../logger');
const json = require('../json');
const licenceDataService = config.get('LICENCE_DATA_SVC_HOST') +'/membership/licence-seat-holders/';

const headers = {
  'X-Api-Key': config.get('API_GATEWAYKEY')
};

function* getUserList(accessLicenceId) {

    let response = yield fetch(licenceDataService +accessLicenceId, {headers:headers});

    if (response.status >= 400) {
      logger.log('error', 'Failed to fetch licence data for accessLicenceId=%s, error=%s', accessLicenceId, response.statusText);
        let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.log('info', 'Retrieved userList for accessLicenceId=%s', accessLicenceId);
    return yield json.parse(response);
}

function* getAdminUserList(accessLicenceId) {

    let response = yield fetch(licenceDataService +accessLicenceId+'/admins', {headers:headers});

    if (response.status >= 400) {
      logger.log('error', 'Failed to fetch licence admins users for accessLicenceId=%s, error=%s', accessLicenceId, response.statusText);
        let err = new Error(response.statusText);
      err.status = response.status;
      throw err;
    }

    logger.log('info', 'Retrieved admin users for accessLicenceId=%s', accessLicenceId);
    return yield json.parse(response);
}

module.exports = {
    getUserList : getUserList,
    getAdminUserList: getAdminUserList
}
