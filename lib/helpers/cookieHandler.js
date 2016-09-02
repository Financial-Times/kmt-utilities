const Cookies = require('cookies');
const config = require('../config');
const logger = require('../logger');

function decode(string) {
  var body = new Buffer(string, 'base64').toString('utf8');
  return JSON.parse(body);
}

//TODO make this less brittle and configurable
module.exports = {
  getKmtCookie: function(req, res) {
    const cookieHandler = new Cookies(req, res, {keys:[config.get('KMT_SECRET')]});
    const getKmtCookie = cookieHandler.get('FTkmt', {signed:true});
    if (getKmtCookie) {
        logger.info({operation: 'getKmtCookie', result: 'getKmtCookie cookie exists', cookieValue:getKmtCookie});
        return decode(getKmtCookie);
    }

    logger.info({operation:'getKmtCookie', result:'getKmtCookie cookie does not exist'});
    return;
  }
};
