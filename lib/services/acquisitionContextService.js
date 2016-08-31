const fetch = require('isomorphic-fetch');
const config = require('../config');
const logger = require('../logger');
const json = require('../json');
const acquisitionContextService = config.get('ACQ_CTX_SVC_HOST') + '/acquisition-contexts/v1?access-licence-id=';
const headers = {'X-Api-Key': config.get('MEMCOM_APIKEY')};

module.exports = {
  getAcsDetails: function* (accessLicenceId) {
    try {

      logger.info({operation:'getAcsDetails', licenceId:accessLicenceId});

      const response = yield fetch(acquisitionContextService + accessLicenceId, { headers: headers });

      if (response.status !== 200) {

        logger.info({operation:'getAcsDetails', result:'failed', licenceId:accessLicenceId, error:response.statusText});

        throw new Error(response.statusText);
      }

      logger.info({operation:'getAcsDetails', result:'success', licenceId:accessLicenceId});

        return yield json.parse(response);
    }
    catch (err) {
      throw err;
    }
  }

};
