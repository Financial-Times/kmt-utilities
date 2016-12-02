const Cookies = require('cookies');
const config = require('../config');
const logger = require('../logger');
const maxAge = 10 * 60 * 1000; //10mins

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

  setLicenceListCookie: function(req, res, licenceList) {
    const cookieHandler = new Cookies(req, res, {keys:[config.get('KMT_SECRET')]});
    cookieHandler.set('FTKatL',JSON.stringify(licenceList),{
      maxAge: maxAge,
      signed: true
    });
    logger.info({operation:'setLicenceListCookie', licenceList:licenceList});
  },

  getLicenceListCookie: function(req, res) {
    const cookieHandler = new Cookies(req, res);
    const licenceListCookie = cookieHandler.get('FTKatL');
    if (licenceListCookie) {
      try {
        let cachedLicences = JSON.parse(decodeURIComponent(licenceListCookie));
        logger.info({operation: 'licenceListCookie', cookieValue:cachedLicences});
        return cachedLicences;
      } catch (err) {
        logger.info({operation: 'licenceListCookie', err});
      }
    }

    logger.info({operation:'getlicenceListCookie', result:'getKatCookie cookie does not exist'});
  }
};
