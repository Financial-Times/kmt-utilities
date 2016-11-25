const Cookies = require('cookies');
const config = require('../config');
const logger = require('../logger');

function decode(string) {
  const body = new Buffer(string, 'base64').toString('utf8');
  return JSON.parse(body);
}

//TODO make this less brittle and configurable
module.exports = {
  getKatCookie: function(req, res) {
    const cookieHandler = new Cookies(req, res, {keys:[config.get('KMT_SECRET')]});
    const getKatCookie = cookieHandler.get('FTkmt', {signed:true});
    if (getKatCookie) {
        logger.info({operation: 'getKatCookie', result: 'getKatCookie cookie exists', cookieValue:getKatCookie});
        return decode(getKatCookie);
    }

    logger.info({operation:'getKatCookie', result:'getKatCookie cookie does not exist'});
    return;
  },

  getLicenceListCookie: function(req, res) {
    const cookieHandler = new Cookies(req, res);
    const licenceListCookie = cookieHandler.get('FTKatL');
    if (licenceListCookie) {
        let cachedLicences = JSON.parse(decodeURIComponent(licenceListCookie))
        logger.info({operation: 'licenceListCookie', cookieValue:cachedLicences});
        return cachedLicences;
    }

    logger.info({operation:'getlicenceListCookie', result:'getKatCookie cookie does not exist'});
    return;
  }
};
