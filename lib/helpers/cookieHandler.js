/*global Buffer*/
const Cookies = require('cookies');
const config = require('../config');
const logger = require('../logger');
const maxAge = 10 * 60 * 1000; //10mins

function decode (string) {
  const body = new Buffer(string, 'base64').toString('utf8');
  return JSON.parse(body);
}

//TODO make this less brittle and configurable
module.exports = {

  get: function (req, res, name) {
    const cookieHandler = new Cookies(req, res);
    const cookieValue = cookieHandler.get(name);

    if (!cookieValue) {
      logger.info({operation:'cookieHandler.get', cookieRequested:name, result:`${name} does not exist`});
      return;
    }
    logger.info({operation: 'cookieHandler.get', cookieRequested:name, result: `${name}cookie exists` });
    return cookieValue;
  },

  set: function (req, res, name, value) {
    logger.info({operation: 'cookieHandler.set', cookieSet:name, result: `${name}cookie set` });
    const cookieHandler = new Cookies(req, res);
    cookieHandler.set(name, value);
  },

  getKatCookie: function (req, res) {
    const cookieHandler = new Cookies(req, res, {keys: [config.KMT_SECRET]});
    const getKatCookie = cookieHandler.get('FTKat', {signed:true});
    if (getKatCookie) {
      logger.info({operation: 'cookieHandler.getKatCookie', result: 'getKatCookie cookie exists', cookieValue:getKatCookie});
      return decode(getKatCookie);
    }

    logger.info({operation:'getKatCookie', result:'getKatCookie cookie does not exist'});
    return;
  },

  getLicenceListCookie: function (req, res) {
    const cookieHandler = new Cookies(req, res);
    const licenceListCookie = cookieHandler.get('FTKatL');
    if (licenceListCookie) {
      try {
        const cachedLicences = JSON.parse(decodeURIComponent(licenceListCookie));
        logger.info({operation: 'licenceListCookie', cookieValue:cachedLicences});
        return cachedLicences;
      } catch (err) {
        logger.info({operation: 'licenceListCookie', err});
      }
    }

    logger.info({operation:'getlicenceListCookie', result:'getKatCookie cookie does not exist'});
  },

  setLicenceListCookie: function (req, res, licenceList) {
    const cookieHandler = new Cookies(req, res, {keys: [config.KMT_SECRET]});
    cookieHandler.set('FTKatL',JSON.stringify(encodeURIComponent(licenceList)),{
      maxAge: maxAge,
      signed: true
    });
    logger.info({operation:'setLicenceListCookie', licenceList:licenceList});
  }
};
